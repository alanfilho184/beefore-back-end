"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const luxon_1 = require("luxon");
class SyncCodeController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(syncCode) {
        return await this.prisma.SyncCode.create({ data: syncCode });
    }
    async getAll() {
        return await this.prisma.SyncCode.findMany();
    }
    async getById(id) {
        return await this.prisma.SyncCode.findUnique({ where: { id: id } });
    }
    async getByCode(code) {
        return await this.prisma.SyncCode.findUnique({ where: { code: code } });
    }
    async getByTelegramId(telegramid) {
        return await this.prisma.SyncCode.findUnique({ where: { telegramid: telegramid } });
    }
    async deleteById(id) {
        return await this.prisma.SyncCode.delete({ where: { id: id } });
    }
    async deleteByCode(code) {
        return await this.prisma.SyncCode.delete({ where: { code: code } });
    }
    async deleteAllExpired() {
        const timeNow = luxon_1.DateTime.now().setZone('America/Fortaleza');
        const ids = new Array();
        const codes = await this.getAll();
        codes.forEach((code) => {
            let expiration = luxon_1.DateTime.fromJSDate(code.expiration).setZone('America/Fortaleza');
            if (expiration <= timeNow) {
                ids.push(code.id);
            }
        });
        return await this.prisma.SyncCode.deleteMany({
            where: {
                id: { in: ids }
            }
        });
    }
}
exports.default = SyncCodeController;
