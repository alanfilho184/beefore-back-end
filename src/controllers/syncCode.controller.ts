export default class SyncCodeController {
    prisma: any
    constructor(prisma: any) {
        this.prisma = prisma
    }

    async create(syncCode: SyncCode) {
        this.prisma.SyncCode.create({ data: syncCode })
    }

    async getById(id: number) {
        this.prisma.SyncCode.findUnique({ where: { id: id } })
    }

    async getByCode(code: string) {
        this.prisma.SyncCode.findUnique({ where: { code: code } })
    }

    async getByTelegramId(telegramid: string) {
        this.prisma.SyncCode.findUnique({ where: { telegramid: telegramid } })
    }

    async deleteById(id: number) {

    }

    async deleteByCode(code: string) {

    }

    async deleteAllExpired() {

    }
}