import * as winston from 'winston';
const numCPUs = require('os').cpus().length;

import { Connector } from './connector/connector';
import { Game } from './game/game';

export class Server {

    private maxInstances: Number = numCPUs
    private connector: Connector;

    constructor(private game: string, instances?: Number) {
        this.maxInstances = instances || process.env.instances || this.maxInstances;

        this.CheckConfiguration();
    }

    public Start(key: string, cert: string, serverCerts: string[], port: number = 3000, authPort: number = 8000) {
        this.connector = new Connector(this.maxInstances, this.game, key, cert, serverCerts);
        this.connector.Start(port, authPort);
    }

    private CheckConfiguration(): void {
        if (this.maxInstances > numCPUs) winston.warn(`You have configured ${this.maxInstances} instances on a ${numCPUs} core machine. To many threads may reduce performance.`)
        if (this.maxInstances <= 1) throw new Error("You need at least 2 instances.");
    }
}