import { EventEmitter } from 'events';
import * as winston from 'winston';
import * as process from 'process';

import { Game } from './game'

export interface ISpawnerMessage {
    command: 'config' | 'spawn';
    data: any;
}

export interface ISpawnerResponse {
    commanb: 'register';
    data: any;
}

export class GameSpawner<T extends Game> {
    games: Game[] = [];
    private processEvents: EventMapper = new EventMapper();

    constructor(private spawn: () => T, private maxGames: number = 1) {
        winston.info(`Game-Spawner instance with pid ${process.pid} loaded.`);
        this.processEvents.on('spawn', id => this.SendResponse(id, this.spawnGame()));
    }

    public start(): GameSpawner<T> {
        process.send('started');
        this.reportLoad();
        return this;
    }

    private SendResponse(id: string, data: any) {
        this.processEvents.sendMessage('response', id, data)
    }

    private spawnGame(): string {
        if (this.games.length >= this.maxGames) return null;
        let game = this.spawn();
        this.games.push(game);
        this.reportLoad();
        return game.id;
    }

    private despawnGame() {

    }

    private reportLoad() {
        this.processEvents.sendMessage('loadChanged', this.games.length, this.games.length < this.maxGames);
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