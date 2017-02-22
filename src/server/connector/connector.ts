import { connect, createServer, ConnectionOptions, TlsOptions } from 'tls';
import { decode, encode } from 'msgpack-lite';
import * as winston from 'winston';

import { AuthEndpoint } from './endpoints';
import { Pool } from './instance';
import { Endpoint } from './protocol';

const endpoints: { [key: number]: Endpoint } = {
    0: new AuthEndpoint('auth')
};

export class Connector {

    private socketOptions: ConnectionOptions;
    private serverOptions: TlsOptions;

    private pool: Pool;

    constructor(private instances: number, private game: string, private globalGames: any, key: string, cert: string, serverCerts: string[],
        rejectUnauthorized: boolean = true) {
        this.serverOptions = {
            key,
            cert,

            requestCert: rejectUnauthorized,
            rejectUnauthorized,
            ca: serverCerts
        };
    }

    public Start(port: number) {
        winston.info("---------------------------");
        winston.info("Starting connector server");
        this.StartConnectorServer(port);
        winston.info("---------------------------");
        winston.info("Populating game-server pool");
        this.pool = new Pool(this.game, this.globalGames, this.instances);
        winston.info("---------------------------");
    }

    private StartConnectorServer(port: number) {
        let server = createServer(this.serverOptions, (stream) => {
            winston.info(`Stream opened on ${stream.remoteAddress}:${stream.remotePort}`);
            winston.info(`Sending welcome message`);
            let user = null;
            stream.on("data", (chunk: Buffer) => {
                let packet = decode(chunk);
                winston.info(`<<< ${JSON.stringify(packet)}`);
                let resultCallback = (data: any) => {
                    let result = { cmd: packet.cmd, data };
                    if (packet.id) { result['id'] = packet.id; };
                    winston.info(`>>> ${JSON.stringify(result)}`);
                    stream.write(encode(result));
                }
                let errorCallback = (message: string) => {
                    let result = { cmd: 0, data: { message } };
                    if (packet.id) { result['id'] = packet.id; };
                    winston.error(`>>> ${JSON.stringify(result)}`);
                    stream.write(encode(result));
                }
                if (!user) {
                    if (packet.cmd === 1) {
                        endpoints[0].execute(packet.data, (error, data) => {
                            if (error) { return errorCallback(error); }
                            user = data;
                            resultCallback(data);
                        });
                    } else {
                        errorCallback("Authentification required");
                    }
                } else {
                    switch (packet.cmd) {
                        case 1: {
                            this.pool.getGlobalInstance(packet.data.type).join('global', user, () => { return; });
                        }
                        default:
                            resultCallback(packet.data);
                            break;
                    }
                }

            });
        });

        server.listen(port, () => {
            winston.info('Server bound on port ' + port);
            /*setTimeout(() => {
                let spawner = this.pool.getFreeInstance();
                if (spawner) { spawner.createNewInstance((id) => winston.info(`Got game instance with id ${id}`)); }
                else { winston.error('No fee instences'); }
            }, 5000);*/
        });
    }
}