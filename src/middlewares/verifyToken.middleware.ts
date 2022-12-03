import { Request, Response, NextFunction } from 'express'
import AuthServices from '../services/auth.services'
import prisma from '../config/database'
import UserController from '../controllers/user.controller'
import { DateTime } from 'luxon'
import { Socket } from 'socket.io'

const userController = new UserController(prisma)
const authServices = new AuthServices()

const excludeRoutes = ['POST|/auth/login', 'POST|/user', 'POST|/relatory', 'GET|/log']

export async function verifyToken(req: Request, res: Response, next: NextFunction) {
    req.startTime = DateTime.now().setZone('America/Fortaleza').toMillis()
    if (!excludeRoutes.includes(`${req.method}|${req.path.endsWith('/') ? req.path.substring(0, req.path.length - 1) : req.path}`)) {
        if (!req.headers.authorization) {
            return res.status(401).json({ error: 'Token não encontrado' })
        } else {
            try {
                const userId = authServices.verifyToken(req.headers.authorization)

                if (!userId) {
                    return res.status(401).json({ error: 'Token inválido' })
                } else {
                    const user = await userController.getById(userId.id)

                    req.user = {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        preferences: user.preferences,
                        type: user.type,
                    }
                    next()
                }
            } catch (err) {
                return res.status(500).json({ error: 'Erro ao tentar validar token' })
            }
        }
    } else {
        return next()
    }
}

export async function verifyTokenWebsocket(socket: Socket, next: (Error?: Error) => void) {
    if (!socket.handshake.headers.authorization) {
        socket.disconnect(true)
        next(new Error('Token não encontrado'))
    } else {
        try {
            const userId = authServices.verifyToken(socket.handshake.headers.authorization)

            if (!userId) {
                socket.disconnect(true)
                next(new Error('Token inválido'))
            } else {
                next()
            }
        } catch (err) {
            socket.disconnect(true)
            next(new Error('Erro ao tentar validar token'))
        }
    }
}
