import { Router, Request, Response } from 'express'
import { DateTime } from 'luxon'
import path from 'path'
import LogHandler from '../logs'

const router = Router()
const logHandler = new LogHandler()

router.get('/', async (req: Request, res: Response) => {
    try {
        if (req.headers.authorization === process.env.ADMIN_TOKEN) {
            if (req.body.day) {
                const logDate = DateTime.fromFormat(req.body.day, 'dd-LL-yyyy')
                const log = logHandler.searchLogFile(logDate)

                if (log) {
                    res.status(200).sendFile(path.join(__dirname, '..', 'logs', `log-${logDate.toFormat('dd-LL-yyyy')}.log`))
                } else {
                    res.status(404).json({ error: 'Log não encontrado' })
                }
            } else {
                res.status(200).sendFile(
                    path.join(__dirname, '..', 'logs', `log-${DateTime.now().setZone('America/Fortaleza').toFormat('dd-LL-yyyy')}.log`),
                )
            }
        } else {
            res.status(401).json({
                error: 'Somente o administrador pode acessar este recurso',
            })
        }
    } catch (err) {
        res.status(500).json({
            error: 'Error ao tentar retornar a lista de autorizações',
        })
    }
})

export default router
