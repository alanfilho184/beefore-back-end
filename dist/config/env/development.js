"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ConfigDevelopment {
    constructor() {
        this.env = 'development';
        this.PORT = Number(process.env.PORT);
        this.API_BASE = '/';
        this.DATABASE_URL = process.env.DATABASE_URL;
    }
}
exports.default = new ConfigDevelopment();
