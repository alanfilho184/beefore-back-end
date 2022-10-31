export default class RelatoryController {
    prisma: any
    constructor(prisma: any) {
        this.prisma = prisma
    }

    async create(newRelatory: Relatory): Promise<Relatory> {
        return await this.prisma.Relatory.create({
            data: newRelatory
        })
    }

    async getByUserId(userid: number): Promise<Relatory> {
        return await this.prisma.Relatory.findUnique({ where: { userid: userid } })
    }

    async getAll(): Promise<Array<Relatory>> {
        return await this.prisma.Relatory.findMany()
    }

    async updateActionsByUserId(userid: number, newAction: Action): Promise<Relatory> {
        return await this.prisma.Relatory.update({ data: { actions: newAction }, where: { userid: userid } })
    }

    async deleteByUserId(userid: number): Promise<void> {
        return await this.prisma.Relatory.delete({ where: { id: userid } })
    }
}