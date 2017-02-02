import { Game } from '../src/server/game/game';
import { GameSpawner } from '../src/server/game/game-spawner';
import * as winston from 'winston';

new GameSpawner(() => new TicTacToe(), 10).start();

class TicTacToe extends Game {
    constructor() {
        super(0.5);
        winston.info(`Tic Tac Toe game ${this.id} created`);
    }

    start() { }

    update(delta: number) {}
}