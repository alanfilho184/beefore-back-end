"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// import helmet from 'helmet';
const config_1 = require("./config/config");
const database_1 = require("./config/database");
const middlewares_1 = __importDefault(require("./middlewares"));
const routes_1 = __importDefault(require("./routes"));
const bot_1 = __importDefault(require("./utils/telegram/bot"));
const app = (0, express_1.default)();
const configureExpress = () => {
    app.use((0, cors_1.default)({
        origin: process.env.CORS_ORIGIN
    }));
    app.use(express_1.default.json());
    app.use(middlewares_1.default);
    app.use(config_1.config.default.API_BASE, routes_1.default);
    bot_1.default.launch();
    return app;
};
const setupApp = (0, database_1.checkConnection)().then(configureExpress);
exports.setupApp = setupApp;
