"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ConfigProduction {
    constructor() {
        this.env = 'production';
        this.PORT = Number(process.env.PORT);
        this.API_BASE = '/';
        this.DATABASE_URL = process.env.DATABASE_URL;
    }
}
exports.default = new ConfigProduction();
