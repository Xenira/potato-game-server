import { Game } from '../src/server/game/game';
import { GameSpawner } from '../src/server/game/game-spawner';
import * as winston from 'winston';

var spawner = new GameSpawner(() => new TicTacToe()).start();

class TicTacToe extends Game {
    constructor() {
        super();
        winston.info("Tic Tac Toe server created");
    }
}