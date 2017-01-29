import * as tls from 'tls';
import * as winston from 'winston';

import { Cluster } from 'cluster';

export class Connector {
    constructor(private instances: Number, key: string, cert: string, serverCerts: string[]) {
        let options: tls.ConnectionOptions = {
            key,
            cert,

            
            ca: serverCerts
        };

        let socket = tls.connect(8000, options, () => {
            winston.info('client connected',
                socket.authorized ? 'authorized' : 'unauthorized');
            process.stdin.pipe(socket);
            process.stdin.resume();
        });
        socket.setEncoding('utf8');
        socket.on('data', (data: string) => {
            winston.info(data);
        });
        socket.on('end', () => {
            winston.info("Connection closed");
        });
        
    }
}