import { connect } from 'tls';
import { Server } from '../src';
import { encode, decode } from 'msgpack-lite';
import * as winston from 'winston';
import * as fs from 'fs';

let globalServers: any = {
    matchmaking: __dirname + '/matchmaking.global'
}

let serverCerts: string[] = [];
let key: string = fs.readFileSync("./test/ssl/gs-test-key.pem", "utf-8");
let cert: string = fs.readFileSync("./test/ssl/gs-test-cert.pem", "utf-8");
readCertificates();

let s: Server = new Server(__dirname + '/tic-tac-toe.game', globalServers, 2);
s.Start(key, cert, serverCerts, 3000, false);

setTimeout(() => {
    let socket = connect(3000, 'localhost', { rejectUnauthorized: false }, () => {
        winston.info('client connected', socket.authorized ? 'authorized' : 'unauthorized');
        socket.write(encode({ id: 41, cmd: 1, data: { type: 'matchmaking' } }));
        socket.write(encode({ id: 42, cmd: 0, data: { un: 'lasse.sprengel@gmail.com', pw: 'abcdef' } }));
        socket.write(encode({ id: 43, cmd: 1, data: { type: 'matchmaking' } }));
        socket.write(encode({ id: 43, cmd: 1, data: { type: 'matchmaking' } }));
        socket.write(encode({ id: 43, cmd: 1, data: { type: 'matchmaking' } }));
    });
    socket.on('data', (data: Buffer) => {
        console.log(decode(data));
    })
}, 5000);

function readCertificates() {
    fs.readdirSync("./test/ssl/certificates").forEach(f => {
        serverCerts.push(fs.readFileSync(`./test/ssl/certificates/${f}`, "utf-8"));
    });
}
