export default class AuthorizationController {
    prisma: any
    constructor(prisma: any) {
        this.prisma = prisma
    }

    async getAll(type?: AuthorizationTypes): Promise<Array<Authorization>> {
        if (type) {
            return await this.prisma.Authorization.findMany({
                where: { type: type },
            })
        } else {
            return await this.prisma.Authorization.findMany()
        }
    }

    async getById(id: number): Promise<Authorization> {
        return await this.prisma.Authorization.findUnique({ where: { id: id } })
    }

    async getByUserId(userId: number): Promise<Authorization> {
        return await this.prisma.Authorization.findUnique({
            where: { userid: userId },
        })
    }

    async getByUserEmail(email: string): Promise<Array<string>> {
        return await this.prisma.$queryRaw`SELECT data->>'name' FROM "Authorization" WHERE data->>'email' = ${email}`
    }

    async getByUserCardId(cardId: string): Promise<Array<string>> {
        return await this.prisma.$queryRaw`SELECT data->>'name' FROM "Authorization" WHERE data->>'cardid' = ${cardId}`
    }

    async create(authorization: Authorization): Promise<Authorization> {
        return await this.prisma.Authorization.create({ data: authorization })
    }

    async updateFieldById(id: number, field: string, value: string): Promise<Authorization> {
        return await this.prisma.Authorization.update({
            where: { id: id },
            data: { [field]: value },
        })
    }

    async deleteById(id: number): Promise<void> {
        return await this.prisma.Authorization.delete({ where: { id: id } })
    }

    async approve(authorization: Authorization): Promise<true | string> {
        return await new Promise((resolve, reject) => {
            if (authorization.type == 'Reservation') {
                this.prisma.Reservation.create({ data: authorization.data })
                    .then(() => {
                        this.prisma.Authorization.delete({
                            where: { id: authorization.id },
                        })
                            .then(() => {
                                resolve(true)
                            })
                            .catch((err: Error) => {
                                reject(err)
                            })
                    })
                    .catch((err: Error) => {
                        reject(err)
                    })
            } else if (authorization.type == 'User') {
                this.prisma.User.create({ data: authorization.data })
                    .then(() => {
                        this.prisma.Authorization.delete({
                            where: { id: authorization.id },
                        })
                            .then(() => {
                                resolve(true)
                            })
                            .catch((err: Error) => {
                                reject(err)
                            })
                    })
                    .catch((err: Error) => {
                        reject(err)
                    })
            }
        })
    }

    async deny(authorization: Authorization): Promise<void> {
        return await this.prisma.Authorization.delete({
            where: { id: authorization.id },
        })
    }
}
