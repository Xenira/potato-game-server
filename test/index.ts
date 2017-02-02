import { Server } from '../src';
import * as fs from 'fs';

let serverCerts: string[] = [];
let key: string = fs.readFileSync("./test/ssl/gs-test-key.pem", "utf-8");
let cert: string = fs.readFileSync("./test/ssl/gs-test-cert.pem", "utf-8");

readCertificates();

let s: Server = new Server(__dirname + '/tic-tac-toe.game', 2);
s.Start(key, cert, serverCerts);

let matchmaking = new Server('')

function readCertificates() {
    fs.readdirSync("./test/ssl/certificates").forEach(f => {
        serverCerts.push(fs.readFileSync(`./test/ssl/certificates/${f}`, "utf-8"));
    });
}
