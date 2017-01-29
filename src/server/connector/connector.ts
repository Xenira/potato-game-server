import { connect, createServer, ConnectionOptions, TlsOptions } from 'tls';
import * as winston from 'winston';

import { Cluster } from 'cluster';

export class Connector {

    private socketOptions: ConnectionOptions;
    private serverOptions: TlsOptions;

    constructor(private instances: Number, key: string, cert: string, serverCerts: string[]) {
        this.socketOptions = {
            key,
            cert,

            ca: serverCerts
        };

        this.serverOptions = {
            key,
            cert,

            requestCert: true,
            rejectUnauthorized: true,
            ca: serverCerts
        }
    }

    public Start(port: number, authPort: number, host?: string) {
        winston.info("-------------------------");
        winston.info("Connecting to auth-server");
        this.ConnectAuthServer(authPort, host);
        winston.info("Starting connector server");
        this.StartConnectorServer(port);
        winston.info("-------------------------");
    }

    private StartConnectorServer(port: number) {
        winston.info("TLS server starting");
        let server = createServer(this.serverOptions, (stream) => {
            winston.info(`Stream opened on ${stream.remoteAddress}:${stream.remotePort}`);
            stream.on("data", (chunk) => {
                try {
                    if (typeof chunk === "string") winston.info(chunk);
                    else winston.info(chunk.toString("utf-8"));
                } catch (e) {
                    winston.error(e);
                }
            })
        })

        server.listen(port, () => {
            winston.info('Server bound on port ' + port);
        });
    }

    private ConnectAuthServer(port: number, host?: string) {
        let socket = connect(port, host, this.socketOptions, () => {
            winston.info('client connected',
                socket.authorized ? 'authorized' : 'unauthorized');
        });
        socket.setEncoding('utf8');
        socket.on('data', (data: string) => {
            winston.info(data);
        });
        socket.on('end', () => {
            winston.warn("Connection to auth-server closed");
        });
        socket.on("error", (e) => {
            winston.error("Auth server error", e);
            setTimeout(() => {
                socket.end();
                winston.info("Trying to reconnect");
                this.ConnectAuthServer(port, host);
            }, 15 * 1000);
        })
    }
}