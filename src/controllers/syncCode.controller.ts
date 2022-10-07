import { DateTime as time } from "luxon"
export default class SyncCodeController {
    prisma: any
    constructor(prisma: any) {
        this.prisma = prisma
    }

    async create(syncCode: SyncCode) {
        return await this.prisma.SyncCode.create({ data: syncCode })
    }

    async getAll() {
        return await this.prisma.SyncCode.findMany()
    }

    async getById(id: number) {
        return await this.prisma.SyncCode.findUnique({ where: { id: id } })
    }

    async getByCode(code: string) {
        return await this.prisma.SyncCode.findUnique({ where: { code: code } })
    }

    async getByTelegramId(telegramid: string) {
        return await this.prisma.SyncCode.findUnique({ where: { telegramid: telegramid } })
    }

    async deleteById(id: number) {
        return await this.prisma.SyncCode.delete({ where: { id: id } })
    }

    async deleteByCode(code: string) {
        return await this.prisma.SyncCode.delete({ where: { code: code } })
    }

    async deleteAllExpired() {
        const timeNow = time.now().setZone('America/Fortaleza')
        const ids = new Array()

        const codes = await this.getAll()

        codes.forEach((code: SyncCode) => {
            let expiration = time.fromJSDate(code.expiration).setZone('America/Fortaleza')

            if(expiration <= timeNow){
                ids.push(code.id)
            }
        })

        return await this.prisma.SyncCode.deleteMany({
            where: {
                id: { in: ids }
            }
        })
    }
}