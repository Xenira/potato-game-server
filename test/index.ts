import { Server } from '../src';
import * as fs from 'fs';

var serverCerts: string[] = [];
var key: string = fs.readFileSync("./test/ssl/gs-test-key.pem", "utf-8")
var cert: string = fs.readFileSync("./test/ssl/gs-test-cert.pem", "utf-8")

readCertificates();

var s: Server = new Server(__dirname + '/tic-tac-toe.game', 2);
s.Start(key, cert, serverCerts);

function readCertificates() {
    fs.readdirSync("./test/ssl/certificates").forEach(f => {
        serverCerts.push(fs.readFileSync(`./test/ssl/certificates/${f}`, "utf-8"));
    })
}
