/// <reference path="../node_modules/@types/jasmine/index.d.ts" />

import { Server } from '../src'

describe("Server", () => {
    describe("#contructor", () => {
        it("should initialize", () => {
            expect(() => new Server()).not.toThrow();
        });
        it("should throw when not enough instances", () => {
            expect(() => new Server(1)).toThrowError("You need at least 2 instances.");
        });
    });
});