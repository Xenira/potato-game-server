import { Game } from './game';

export class GlobalGame extends Game {
    timeWithoutPlayer: number = 0;

    constructor(ticks: number = 2, private maxIdleTime: number = 30 * 1000) {
        super(ticks >= 1 ? ticks : 1);
    }

    update(delta: number) {
        super.update(delta);
        this.timeWithoutPlayer = this.players.length > 0 ? 0 : this.timeWithoutPlayer + delta;
        if (this.timeWithoutPlayer > this.maxIdleTime) {
            this.close();
        }
    }
}