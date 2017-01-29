import * as winston from 'winston';
import * as process from 'process';

import { Game } from './game'

winston.info(`Game instance spawned with pid ${process.pid}`);

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
    thread: any;

    constructor(private spawn: () => T) {
        process.on('message', data => this.MessageHandler(data));
    }

    public start(): GameSpawner<T> {
        process.send('started');
        return this;
    }

    public MessageHandler(command: string) {
        winston.info(`Recived data on ${process.pid}`)
        winston.info(command);
        switch (command) {
            case 'config':

                break;
            case 'spawn':
                let game: Game = this.spawn();
                this.games.push(game);
                break;

            default:
                break;
        }
    };
}