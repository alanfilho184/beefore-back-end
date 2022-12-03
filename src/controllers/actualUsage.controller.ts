export default class ActualUsageController {
    prisma: any
    constructor(prisma: any) {
        this.prisma = prisma
    }

    async addOne(userid: number): Promise<void> {
        await this.prisma.ActualUsage.create({
            data: {
                userid: userid,
            },
        })
    }

    async removeOne(userid: number): Promise<void> {
        await this.prisma.ActualUsage.delete({
            where: {
                userid: userid,
            },
        })
    }

    async getUsage(): Promise<number> {
        return await this.prisma.ActualUsage.count()
    }
}
