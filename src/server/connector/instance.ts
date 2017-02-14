import { fork, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { generate } from 'shortid';
import * as winston from 'winston';

interface ProcessMessage {
    event: string;
    args: any[];
}

class EventMapper extends EventEmitter {
    private callbacks: any = {};

    constructor(private process: ChildProcess) {
        super();
        process.on('close', (c, s) => this.emit('close', c, s));
        process.on('disconnet', () => this.emit('disconnet'));
        process.on('error', (e) => this.emit('error', e));
        process.on('exit', (c, s) => this.emit('exit', c, s));
        process.on('message', m => this.parseMessage(m));
        this.on('response', (id: string, ...args: any[]) => this.handleResponse(id, args));
    }

    private parseMessage(message: ProcessMessage) {
        this.emit(message.event, ...message.args);
    }

    public sendMessage(message: string, ...args: any[]) {
        this.process.send({ event: message, args: args });
    }

    public sendMessageWithCallback(message: string, callback: (...args: any[]) => void, ...args: any[]) {
        let id = generate();
        this.callbacks[id] = callback;
        this.sendMessage(message, id, ...args);
    }

    private handleResponse(id: string, args: any[]) {
        if (!this.callbacks[id]) { return; }
        this.callbacks[id](...args);
        delete this.callbacks[id];
    }
}

export class Instance extends EventEmitter {
    public games: string[] = [];
    private process: ChildProcess;
    private processEvents: EventMapper;
    private _load: number = 0;
    private _free: boolean = false;

    get load() { return this._load; }
    get free() { return this._free; }

    constructor(private game: string) {
        super();
        this.process = fork(this.game);
        this.processEvents = new EventMapper(this.process);
        this.registerListeners();
    }

    private registerListeners() {
        this.processEvents.on('loadChanged', (l, f) => this.reportLoad(l, f));
    }

    private reportLoad(load: number, free: boolean) {
        winston.info(`Load is ${load}. Accapting new: ${free}`);
        this._load = load;
        this._free = free;
    }

    public createNewInstance(callback: (id: string) => void) {
        this.processEvents.sendMessageWithCallback('spawn', callback);
    }

    public join(id: string, user: any, callback: (data: any) => void) {
        this.processEvents.sendMessageWithCallback('join', callback, id, user);
    }
}

export class Pool {
    private instances: Instance[] = [];
    private globals: { [key: string]: Instance } = {};

    constructor(game: string, private globalGames: any, count: number) {
        for (let i = 0; i < count; i++) {
            let instance = new Instance(game);
            this.registerListeners(instance);
            this.instances.push(instance);
        }
    }

    public getGlobalInstance(game: string) {
        if (!this.globalGames[game]) { return null; }
        let gameFile = this.globalGames[game];
        if (this.globals[gameFile]) { return this.globals[gameFile]; }
        let instance = new Instance(gameFile);
        this.globals[gameFile] = instance;
        return instance;
    }

    getGameInstance(id: string): Instance {
        for (let i = 0; i < this.instances.length; i++) {
            let instance = this.instances[i];
            if (instance.games.indexOf(id) > -1) {
                return instance;
            }
        }
    }

    private registerListeners(instance: Instance) {
    }

    public getFreeInstance(): Instance {
        let inst = this.instances.filter(i => i.free).sort((a, b) => a.load - b.load);
        if (inst.length <= 0) {
            winston.warn(`Server hase no free game instances left!`);
            return null;
        };
        return inst[0];
    }
}