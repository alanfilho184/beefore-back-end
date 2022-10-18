"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ConfigTest {
    constructor() {
        this.env = 'test';
        this.PORT = Number(process.env.PORT);
        this.API_BASE = '/';
        this.DATABASE_URL = process.env.TEST_DATABASE_URL;
    }
}
exports.default = new ConfigTest();
