import { kami_cache } from '@alanfilho184/kami-lru-cache'
import prisma from '../../config/database'
import { DateTime as time } from 'luxon'

import SyncCodeController from '../../controllers/syncCode.controller'
const syncCodeController = new SyncCodeController(prisma)

const cache = new kami_cache({
    maxAge: 1000 * 60 * 10,
    rateOfVerifyAgedKeys: 1000 * 15,
    updateAgeOnGet: false,
})

syncCodeController.deleteAllExpired().then(() => {
    syncCodeController.getAll().then(codes => {
        codes.forEach((code: SyncCode) => {
            cache.set(code.code, {
                telegramid: code.telegramid,
                expiration: code.expiration,
            })
        })

        cache.events.on('keySet', async (key: string) => {
            const codeInfo = cache.get(key)

            try {
                await syncCodeController.create({
                    code: key,
                    telegramid: codeInfo.telegramid,
                    expiration: codeInfo.expiration,
                })
            } catch (err) {
                return
            }
        })

        const deleteFromDb = async (key: string) => {
            await syncCodeController.deleteByCode(key)
        }

        cache.events.on('keyAutoDelete', deleteFromDb)
        cache.events.on('keyDelete', deleteFromDb)
    })
})

function codeGenerator(telegramid: string) {
    let code = '0'

    cache.map.forEach((jsonCodeInfo: string) => {
        const codeInfo = JSON.parse(jsonCodeInfo)

        if (codeInfo.content.telegramid == telegramid) {
            code = codeInfo.key
            return code
        }
    })

    if (code == '0') {
        do {
            code = Math.floor(Math.random() * 999999).toString()

            while (code.length < 6) {
                code = '0' + code
            }
        } while (cache.has(code))

        cache.set(code, {
            telegramid: telegramid,
            expiration: time
                .fromMillis(time.now().setZone('America/Fortaleza').toMillis() + 1000 * 60 * 10)
                .setZone('America/Fortaleza')
                .toISO(),
        })
    }

    return code
}

export default codeGenerator
export { cache }
