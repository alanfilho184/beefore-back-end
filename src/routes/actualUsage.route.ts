import { Router, Request, Response } from 'express'
import prisma from '../config/database'
import ActualUsageController from '../controllers/actualUsage.controller'
import RelatoryController from '../controllers/relatory.controller'
import ActualUsageServices from '../services/actualUsage.services'
import LogHandler from '../logs'
import { DateTime as time } from 'luxon'

const router = Router()
const actualUsageController = new ActualUsageController(prisma)
const relatoryController = new RelatoryController(prisma)
const actualUsageServices = new ActualUsageServices(relatoryController)
const logHandler = new LogHandler()

router.get('/statistics', async (req: Request, res: Response) => {
    try {
        const response = await Promise.all([actualUsageController.getUsage(), actualUsageServices.getAverageTimeUsage()])

        const usage = response[0]
        const averageTimeUsage = response[1]

        res.status(200).json({
            actualUsage: usage,
            averageTimeUsage: averageTimeUsage.totalAverage.average || 0,
            mostUsedDay: averageTimeUsage.mostUsedDay || time.now().toFormat('dd/LL/yyyy'),
        })
    } catch (err) {
        logHandler.registerError(err)
        res.status(500).end()
    }
})

export default router
