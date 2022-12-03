import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { config } from './config/config'
import { checkConnection } from './config/database'
import middlewares from './middlewares'
import routes from './routes'
import bot from './utils/telegram/bot'
import websocket from './websocket'

const app = express()

const configureExpress = () => {
    app.set('trust proxy', true)
    app.use(helmet())
    app.use(
        cors({
            origin: config.default.CORS_ORIGIN,
        }),
    )
    app.use(express.json())
    app.use(middlewares)
    app.use(config.default.API_BASE, routes)

    if (config.default.env != 'test') {
        bot.launch()
    }

    app.start = (port: number, callback: () => void) => {
        const server = app.listen(port, callback)
        websocket(server)
    }

    return app
}

const setupApp = checkConnection().then(configureExpress)

export { setupApp }
