import { config } from '../config/config'
import EventListener from 'events'
import { Server } from 'socket.io'
import prisma from '../config/database'
import ActualUsageController from '../controllers/actualUsage.controller'
import { verifyTokenWebsocket } from '../middlewares/verifyToken.middleware'

const Events = new EventListener()
const actualUsageController = new ActualUsageController(prisma)

export default function createSocket(server: any) {
    const io = new Server(server, {
        cors: {
            origin: config.default.CORS_ORIGIN,
        },
    })

    io.use(verifyTokenWebsocket)

    io.on('connection', socket => {
        socket.join('dashboard')
    })

    Events.on('updateActualUsage', async () => {
        const actualUsage = await actualUsageController.getUsage()

        io.to('dashboard').emit('actualUsage', actualUsage)
    })
}

export { Events }
