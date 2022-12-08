import { config } from '../config/config'
import EventListener from 'events'
import { Server } from 'socket.io'
import prisma from '../config/database'
import ActualUsageController from '../controllers/actualUsage.controller'
import { verifyTokenWebsocket } from '../middlewares/verifyToken.middleware'
import qrcode from 'qrcode'

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
        if (socket.data.user.email == process.env.QR_EMAIL) {
            socket.join('qrcodeViewer')
        } else {
            socket.join('dashboard')
        }
    })

    Events.on('updateActualUsage', async () => {
        const actualUsage = await actualUsageController.getUsage()

        io.to('dashboard').emit('actualUsage', actualUsage)
    })

    Events.on('refreshQRCode', async code => {
        const qr = await qrcode.toDataURL(`https://beefore.netlify.app/qrcode.html?code=${code}`, {
            errorCorrectionLevel: 'medium',
            scale: 20,
            type: 'image/webp',
        })

        io.to('qrcodeViewer').emit('refreshQRCode', qr)
    })

    Events.on('actionReg', async (user: User, action: Action) => {
        io.to('qrcodeViewer').emit('actionReg', { id: user.id, name: user.name, action: action })
    })
}

export { Events }
