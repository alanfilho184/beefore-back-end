import { DateTime as time } from 'luxon'
export default class SyncCodeController {
    prisma: any
    constructor(prisma: any) {
        this.prisma = prisma
    }

    async create(syncCode: SyncCode): Promise<SyncCode> {
        return await this.prisma.SyncCode.create({ data: syncCode })
    }

    async getAll(): Promise<Array<SyncCode>> {
        return await this.prisma.SyncCode.findMany()
    }

    async getById(id: number): Promise<SyncCode> {
        return await this.prisma.SyncCode.findUnique({ where: { id: id } })
    }

    async getByCode(code: string): Promise<SyncCode> {
        return await this.prisma.SyncCode.findUnique({ where: { code: code } })
    }

    async getByTelegramId(telegramid: string): Promise<SyncCode> {
        return await this.prisma.SyncCode.findUnique({
            where: { telegramid: telegramid },
        })
    }

    async deleteById(id: number): Promise<void> {
        return await this.prisma.SyncCode.delete({ where: { id: id } })
    }

    async deleteByCode(code: string): Promise<void> {
        return await this.prisma.SyncCode.delete({ where: { code: code } })
    }

    async deleteAllExpired(): Promise<void> {
        const timeNow = time.now().setZone('America/Fortaleza')
        const ids: Array<number> = []

        const codes = await this.getAll()

        codes.forEach((code: SyncCode) => {
            const expiration = time.fromJSDate(code.expiration).setZone('America/Fortaleza')

            if (expiration <= timeNow) {
                if (code.id) {
                    ids.push(code.id)
                }
            }
        })

        return await this.prisma.SyncCode.deleteMany({
            where: {
                id: { in: ids },
            },
        })
    }
}
