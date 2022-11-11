import { Request, Response, NextFunction } from 'express'
import { DateTime } from 'luxon'
import color from 'colors'
import LogHandler from '../logs'

const logHandler = new LogHandler()

export function logger(req: Request, res: Response, next: NextFunction) {
    const time = DateTime.now().setZone('America/Fortaleza').toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)
    const resource = `${req.method} ${req.url}`

    res.on('finish', () => {
        let user
        if (req.user && Object.keys(req.body)[0]) {
            const data = req.body
            data.password ? (data.password = '*') : ''
            data.telegramid ? (data.telegramid = '*') : ''

            user = `User: [ID: ${req.user.id} Type: ${req.user.type}] | Data: [${JSON.stringify(data)}]`
        } else if (req.user && !Object.keys(req.body)[0]) {
            user = `User: [ID: ${req.user.id} Type: ${req.user.type}]`
        } else if (Object.keys(req.body)[0]) {
            const data = req.body
            data.password ? (data.password = '*') : ''
            data.telegramid ? (data.telegramid = '*') : ''

            user = `Data: [${JSON.stringify(data)}]`
        } else {
            user = 'Unauthenticated | No data'
        }

        let status: string = res.statusCode.toString()
        const statusNoColor = status

        if (parseInt(status) >= 200 && parseInt(status) < 300) {
            status = color.green(status)
        } else if (parseInt(status) >= 300 && parseInt(status) < 400) {
            status = color.cyan(status)
        } else if (parseInt(status) >= 400 && parseInt(status) < 500) {
            status = color.yellow(status)
        } else {
            status = color.red(status)
        }

        const execTime = (DateTime.now().toMillis() - req.startTime).toString() + 'ms'

        console.log(
            `[ ${color.green(time)} ] - [ ${color.green(resource)} ] - [ ${color.cyan(user)} ] - [ ${status} ${color.underline(execTime)} ]\n`,
        )
        logHandler.updateActualLogFile(`[ ${time} ] - [ ${resource} ] - [ ${user} ] - [ ${statusNoColor} ${execTime} ]\n`)
    })

    next()
}
