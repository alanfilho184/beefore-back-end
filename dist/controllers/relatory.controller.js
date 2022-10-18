"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RelatoryController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(newRelatory) {
        return await this.prisma.Relatory.create({
            data: newRelatory
        });
    }
    async getByUserId(userid) {
        return await this.prisma.Relatory.findUnique({ where: { userid: userid } });
    }
    async getAll() {
        return await this.prisma.Relatory.findMany();
    }
    async updateActionsByUserId(userid, newAction) {
        return await this.prisma.Relatory.update({ data: { actions: newAction }, where: { userid: userid } });
    }
    async deleteByUserId(userid) {
        return await this.prisma.Relatory.delete({ where: { id: userid } });
    }
}
exports.default = RelatoryController;
