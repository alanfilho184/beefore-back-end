"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AuthorizationController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAll(type) {
        if (type) {
            return await this.prisma.Authorization.findMany({ where: { type: type } });
        }
        else {
            return await this.prisma.Authorization.findMany();
        }
    }
    async getById(id) {
        return await this.prisma.Authorization.findUnique({ where: { id: id } });
    }
    async getByUserId(userId) {
        return await this.prisma.Authorization.findUnique({ where: { userid: userId } });
    }
    async create(authorization) {
        return await this.prisma.Authorization.create({ data: authorization });
    }
    async updateFieldById(id, field, value) {
        return await this.prisma.Authorization.update({ where: { id: id }, data: { [field]: value } });
    }
    async deleteById(id) {
        return await this.prisma.Authorization.delete({ where: { id: id } });
    }
    async approve(authorization) {
        return await new Promise(async (resolve, reject) => {
            if (authorization.type == 'Reservation') {
                this.prisma.Reservation.create({ data: authorization.data })
                    .then(() => {
                    this.prisma.Authorization.delete({ where: { id: authorization.id } })
                        .then(() => {
                        resolve(true);
                    })
                        .catch((err) => {
                        reject(err);
                    });
                })
                    .catch((err) => {
                    reject(err);
                });
            }
            else if (authorization.type == 'User') {
                this.prisma.User.create(authorization.data)
                    .then(() => {
                    this.prisma.Authorization.delete({ where: { id: authorization.id } })
                        .then(() => {
                        resolve(true);
                    })
                        .catch((err) => {
                        reject(err);
                    });
                })
                    .catch((err) => {
                    reject(err);
                });
            }
        });
    }
    async deny(authorization) {
        return await this.prisma.Authorization.delete({ where: { id: authorization.id } });
    }
}
exports.default = AuthorizationController;
