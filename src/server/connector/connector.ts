import { createServer, TlsOptions } from 'tls';
import * as winston from 'winston';

import { Pool } from './instance';
import { Session } from './session';

export class Connector {
    private serverOptions: TlsOptions;

    static pool: Pool;

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
        Connector.pool = new Pool(this.game, this.globalGames, this.instances);
        winston.info("---------------------------");
    }

    private StartConnectorServer(port: number) {
        let server = createServer(this.serverOptions, (stream) => new Session(stream));

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