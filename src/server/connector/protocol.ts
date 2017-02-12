export abstract class Endpoint {
    constructor(private name: string) {
        BaseFunctions[name] = this;
    }

    abstract execute(data: any, callback: (data: any) => void);
}

export const BaseFunctions: {[key: string]: Endpoint} = { }