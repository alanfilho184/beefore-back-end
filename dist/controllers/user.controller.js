"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(newUser) {
        return await this.prisma.User.create({
            data: newUser
        });
    }
    async getByEmail(email) {
        return await this.prisma.User.findUnique({ where: { email: email } });
    }
    async getByCardId(cardid) {
        return await this.prisma.User.findUnique({ where: { cardid: cardid } });
    }
    async getById(id) {
        return await this.prisma.User.findUnique({ where: { id: id } });
    }
    async getAll() {
        return await this.prisma.User.findMany();
    }
    async updateById(userId, newUser) {
        return await this.prisma.User.update({
            where: {
                id: userId
            },
            data: {
                ...newUser
            }
        });
    }
    async updateFieldById(userId, field, value) {
        return await this.prisma.User.update({
            where: {
                id: userId
            },
            data: {
                [field]: value
            }
        });
    }
    async updatePreferencesById(userId, preference, value) {
        const user = await this.getById(userId);
        return await this.prisma.User.update({
            where: {
                id: userId
            },
            data: {
                preferences: {
                    ...user.preferences,
                    [preference]: value
                }
            }
        });
    }
    async deleteById(userId) {
        return await this.prisma.User.delete({ where: { id: userId } });
    }
    async deleteByEmail(email) {
        return await this.prisma.User.delete({ where: { email: email } });
    }
    async deleteByCardId(cardid) {
        return await this.prisma.User.delete({ where: { cardid: cardid } });
    }
}
exports.default = UserController;
