import * as winston from 'winston';
import * as cluster from 'cluster'
const numCPUs = require('os').cpus().length;

import { Connector } from './connector/connector'

export class Server {

    private maxInstances: Number = numCPUs - 1
    private connector: Connector;

    constructor(instances?: Number) {
        if (cluster.isMaster) {
            this.maxInstances = instances || process.env.instances || this.maxInstances;

            this.CheckConfiguration();
        }
    }

    public Start() {
        if (cluster.isMaster) {
           cluster.fork()
           cluster.on("exit", (worker, code, signal) => {
                winston.warn(`Connector ${worker.process.pid} has exited. Trying to restart`);
                cluster.fork();
            });
        } else {
            this.connector = new Connector();
            cluster.worker.destroy();
        }
    }

    private CheckConfiguration():void {
        if (this.maxInstances > numCPUs) winston.warn(`You have configured ${this.maxInstances} + 1 instances on a ${numCPUs} core machine. To many threads may reduce performance.`)
    }
}