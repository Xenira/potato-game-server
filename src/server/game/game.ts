import { EventEmitter } from 'events';
import { generate } from 'shortid';
import * as winston from 'winston';

export abstract class Game extends EventEmitter {
    protected players: any[] = [];
    private lastTick: number = new Date().getTime();

    readonly id: string = generate();

    // Timer
    private tickTimer: NodeJS.Timer;

    constructor(protected readonly ticks: number = 20) {
        super();
        if (ticks > 1000){
            throw Error(`Can't tick more than once per millisecond`);
        }

        setImmediate(() => this.start());

        if (ticks > 0) {
            this.tickTimer = setInterval(() => this.tick(), 1000 / ticks);
        }
    }

    start(): void { }

    update(delta: number): void { };

    onMessage(message: any) {
        winston.info(`recived msg ${JSON.stringify(message)}`);
    }

    send(players: any[], message: any): void {
        this.emit('msg', players.map(p => p.id), message);
    }

    close() {
        clearInterval(this.tickTimer);
        this.emit('close');
    }

    join(player: any) {
        this.players.push(player);
    }

    private tick() {
        let currentTime = new Date().getTime();
        let delta = currentTime - this.lastTick;
        this.lastTick = currentTime;
        this.update(delta);
    }
}