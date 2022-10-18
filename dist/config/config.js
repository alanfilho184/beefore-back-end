"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const config = require(`./env/${process.env.NODE_ENV || 'development'}.js`);
exports.config = config;
