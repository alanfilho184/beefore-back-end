"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkConnection = void 0;
const client_1 = require("@prisma/client");
const config_1 = require("./config");
const prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: config_1.config.default.DATABASE_URL,
        },
    },
});
const checkConnection = async () => await prisma.$queryRaw `SELECT 1`;
exports.checkConnection = checkConnection;
exports.default = prisma;
