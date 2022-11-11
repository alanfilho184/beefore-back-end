export default class UserController {
    prisma: any
    constructor(prisma: any) {
        this.prisma = prisma
    }

    async create(newUser: User): Promise<User> {
        return await this.prisma.User.create({
            data: newUser,
        })
    }

    async getByEmail(email: string): Promise<User> {
        return await this.prisma.User.findUnique({ where: { email: email } })
    }

    async getByCardId(cardid: string): Promise<User> {
        return await this.prisma.User.findUnique({ where: { cardid: cardid } })
    }

    async getById(id: number): Promise<User> {
        return await this.prisma.User.findUnique({ where: { id: id } })
    }

    async getAll(): Promise<Array<User>> {
        return await this.prisma.User.findMany()
    }

    async updateById(userId: number, newUser: User): Promise<User> {
        return await this.prisma.User.update({
            where: {
                id: userId,
            },
            data: {
                ...newUser,
            },
        })
    }

    async updateFieldById(userId: number, field: string, value: string): Promise<User> {
        return await this.prisma.User.update({
            where: {
                id: userId,
            },
            data: {
                [field]: value,
            },
        })
    }

    async updatePreferencesById(userId: number, preference: string, value: string): Promise<User> {
        const user = await this.getById(userId)

        return await this.prisma.User.update({
            where: {
                id: userId,
            },
            data: {
                preferences: {
                    ...user.preferences,
                    [preference]: value,
                },
            },
        })
    }

    async deleteById(userId: number): Promise<void> {
        return await this.prisma.User.delete({ where: { id: userId } })
    }

    async deleteByEmail(email: string): Promise<void> {
        return await this.prisma.User.delete({ where: { email: email } })
    }

    async deleteByCardId(cardid: string): Promise<void> {
        return await this.prisma.User.delete({ where: { cardid: cardid } })
    }
}
