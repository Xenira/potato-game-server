import { EventEmitter } from 'events';
import * as winston from 'winston';
import * as process from 'process';

import { Game } from './game';

export interface ISpawnerMessage {
    command: 'config' | 'spawn';
    data: any;
}

export interface ISpawnerResponse {
    commanb: 'register';
    data: any;
}

export class GameSpawner<T extends Game> {
    games: { [key: string]: Game } = { };
    private processEvents: EventMapper = new EventMapper();

    constructor(private spawn: () => T, private maxGames: number = 1, global: boolean = false) {
        if (global) { this.games['global'] = spawn(); }

        winston.info(`Game-Spawner instance with pid ${process.pid} loaded.`);
        this.processEvents.on('spawn', id => this.SendResponse(id, this.spawnGame()));
        this.processEvents.on('join', (id: string, game: string, user: any) => this.join(game, user));
        this.processEvents.on('gameMessage', (id: string, message: any) => this.games[id].onMessage(message));
    }

    public start(): GameSpawner<T> {
        process.send('started');
        this.reportLoad();
        return this;
    }

    private join(id: string, user: any) {
        winston.info(`join request for ${id} from ${JSON.stringify(user)}`);
        this.games[id].join(user);
    }

    private SendResponse(id: string, data: any) {
        this.processEvents.sendMessage('response', id, data);
    }

    private spawnGame(): string {
        if (Object.keys(this.games).length >= this.maxGames) { return null; }
        let game = this.spawn();
        this.addGame(game);
        this.reportLoad();
        return game.id;
    }

    private addGame(game: Game) {
        game.on('close', () => this.despawnGame(game));
        game.on('msg', (players: string[], message: any) =>
            this.processEvents.sendMessage('gameMessage', players, message));
        this.games[game.id] = game;
    }

    private despawnGame(game: Game) {
        //delete this.games[game.id];
        //this.processEvents.sendMessage('gameClosed', game.id);
    }

    private reportLoad() {
        let gameCount: number = Object.keys(this.games).length;
        this.processEvents.sendMessage('loadChanged', gameCount, gameCount < this.maxGames);
    }
}

interface ProcessMessage {
    event: string;
    args: any[];
}

class EventMapper extends EventEmitter {
    constructor() {
        super();
        process.on('close', (c, s) => this.emit('close', c, s));
        process.on('disconnet', () => this.emit('disconnet'));
        process.on('error', (e) => this.emit('error', e));
        process.on('exit', (c, s) => this.emit('exit', c, s));
        process.on('message', m => this.parseMessage(m));
    }

    private parseMessage(message: ProcessMessage) {
        this.emit(message.event, ...message.args);
    }

    public sendMessage(message: string, ...args: any[]) {
        process.send({ event: message, args: args });
    }
}