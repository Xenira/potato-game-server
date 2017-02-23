import { ClearTextStream } from 'tls';
import * as winston from 'winston';
import { decode, encode } from 'msgpack-lite';
import { Endpoint } from './protocol';
import { AuthEndpoint } from './endpoints/auth/auth.endpoint';
import { Connector } from './connector';

const endpoints: { [key: number]: Endpoint } = {
    0: new AuthEndpoint('auth')
};

export class Session {

    user: any;

    constructor(private stream: ClearTextStream) {
        winston.info(`Stream opened on ${stream.remoteAddress}:${stream.remotePort}`);
        winston.info(`Sending welcome message`);
        stream.on("data", (chunk: Buffer) => this.onMessage(chunk));
    }

    onMessage(chunk: Buffer) {
        let packet = decode(chunk);
        winston.info(`<<< ${JSON.stringify(packet)}`);
        if (!this.user) {
            if (packet.cmd === 1) {
                endpoints[0].execute(packet.data, (error, data) => {
                    if (error) { return this.sendError(error, packet); }
                    this.user = data;
                    this.sendResponse(data, packet);
                });
            } else {
                this.sendError("Authentification required", packet);
            }
        } else {
            switch (packet.cmd) {
                case 1: {
                    Connector.pool.getGlobalInstance(packet.data.type).join('global', this.user, () => { return; });
                }
                default:
                    this.sendResponse(packet.data, packet);
                    break;
            }
        }
    }

    sendResponse(data: any, packet: any) {
        let result = { cmd: packet.cmd, data };
        if (packet.id) { result['id'] = packet.id; };
        winston.info(`>>> ${JSON.stringify(result)}`);
        this.stream.write(encode(result));
    }

    sendError(message: string, packet: any) {
        let result = { cmd: 0, data: { message } };
        if (packet.id) { result['id'] = packet.id; };
        winston.error(`>>> ${JSON.stringify(result)}`);
        this.stream.write(encode(result));
    }
}