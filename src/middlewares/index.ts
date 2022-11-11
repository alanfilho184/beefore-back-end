import express from 'express'
import { logger } from './logger.middleware'
import { verifyToken } from './verifyToken.middleware'

const router = express.Router()

router.use(verifyToken)
router.use(logger)

export default router
