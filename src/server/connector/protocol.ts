export abstract class Endpoint {
    constructor(private name: string) {
        BaseFunctions[name] = this;
    }

    abstract execute(data: any, callback: (error: string, data: any) => void);
}

export const BaseFunctions: {[key: string]: Endpoint} = { }