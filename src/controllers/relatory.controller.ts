export default class RelatoryController {
    prisma: any
    constructor(prisma: any) {
        this.prisma = prisma
    }

    async create(newRelatory: Relatory) {
        return await this.prisma.Relatory.create({
            data: newRelatory
        })
    }

    async getByUserId(userid: number) {
        return await this.prisma.Relatory.findUnique({ where: { userid: userid } })
    }

    async getAll() {
        return await this.prisma.Relatory.findMany()
    }

    async updateActionsByUserId(userid: number, newAction: Action) {
        return await this.prisma.Relatory.update({ data: { actions: newAction }, where: { userid: userid } })
    }

    async deleteByUserId(userid: number) {
        return await this.prisma.Relatory.delete({ where: { id: userid } })
    }
}