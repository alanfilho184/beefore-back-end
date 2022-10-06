import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/config';
import { checkConnection } from './config/database'
import middlewares from './middlewares'
import routes from './routes'
import bot from './utils/telegram/bot'

const app = express()

const configureExpress = () => {
    if (config.default.env == 'production') {
        app.use(cors())
        app.use(helmet())
    }
    app.use(express.json())
    app.use(middlewares)
    app.use(config.default.API_BASE, routes)

    bot.launch()

    return app
}

const setupApp = checkConnection().then(configureExpress)

export { setupApp }