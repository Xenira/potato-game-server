import { GameSpawner } from '../src/server/game/game-spawner';
import * as winston from 'winston';
import { GlobalGame } from '../src/server/game/global.game';

class DefaultMatchmaker extends GlobalGame {
    constructor() {
        super(0.5);
        winston.info(`Matchmaking game ${this.id} created`);
    }

    start() { }

    update(delta: number) {}
}

new GameSpawner(() => new DefaultMatchmaker(), 1, true).start();