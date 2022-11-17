import { Router, Request, Response } from 'express'
import prisma from '../config/database'
import UserController from '../controllers/user.controller'
import ActualUsageController from '../controllers/actualUsage.controller'
import RelatoryController from '../controllers/relatory.controller'
import LogHandler from '../logs'

const router = Router()
const userController = new UserController(prisma)
const actualUsageController = new ActualUsageController(prisma)
const relatoryController = new RelatoryController(prisma)
const logHandler = new LogHandler()

router.get('/statistics', async (req: Request, res: Response) => {
    try {
        const usage = await actualUsageController.getUsage()

        res.status(200).json({
            actualUsage: usage
        })
    }
    catch (err) {
        logHandler.registerError(err)
        res.status(500).end()
    }
})

export default router
