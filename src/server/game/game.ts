import { EventEmitter } from 'events'
import { generate } from 'shortid';
import * as winston from 'winston';

export abstract class Game extends EventEmitter {
    private lastTick: number = new Date().getTime();

    readonly id: string = generate();

    constructor(private ticks: number = 20) {
        super();
        setImmediate(() => this.start())
        setInterval(() => this.tick(), 1000 / ticks)
    }

    start(): void { }

    update(delta: number): void { };

    send(players: any[], message: any): void {

    }

    private tick() {
        let currentTime = new Date().getTime();
        let delta = currentTime - this.lastTick;
        this.lastTick = currentTime;
        this.update(delta);
    }
}