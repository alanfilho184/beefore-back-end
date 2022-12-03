import { Router, Request, Response } from 'express'
import prisma from '../config/database'
import UserController from '../controllers/user.controller'
import AuthServices from '../services/auth.services'
import bot from '../utils/telegram/bot'
import { cache } from '../utils/telegram/codeGenerator'
import LogHandler from '../logs'

const router = Router()
const userController = new UserController(prisma)
const authServices = new AuthServices()
const logHandler = new LogHandler()

router.post('/login', async (req: Request, res: Response) => {
    try {
        if (req.body.password && req.body.email) {
            const user = await userController.getByEmail(req.body.email)

            if (user) {
                if (authServices.comparePassword(req.body.password, user.password)) {
                    const token = authServices.createToken(user)

                    res.status(200).json({ token: token })
                } else {
                    res.status(401).json({ error: 'Senha incorreta' })
                }
            } else {
                res.status(404).json({ error: 'Usuário não encontrado' })
            }
        } else {
            res.status(400).json({ error: 'Dados faltando ou incorretos' })
        }
    } catch (err) {
        res.status(500).json({ error: 'Erro ao tentar autenticar' })
        logHandler.registerError(err)
    }
})

router.post('/token', async (req: Request, res: Response) => {
    try {
        if (req.headers.authorization) {
            const tokenPayload = authServices.verifyToken(req.headers.authorization)

            if (tokenPayload) {
                const user = await userController.getById(tokenPayload.id)

                if (user) {
                    const newToken = authServices.createToken(user)

                    res.status(200).json({
                        token: newToken,
                        user: {
                            type: user.type,
                        },
                    })
                } else {
                    res.status(404).json({ error: 'Usuário não encontrado' })
                }
            } else {
                res.status(401).json({ error: 'Token inválido' })
            }
        } else {
            res.status(400).json({ error: 'Dados faltando ou incorretos' })
        }
    } catch (err) {
        res.status(500).json({ error: 'Erro ao tentar autenticar' })
        logHandler.registerError(err)
    }
})

router.post('/sincronizar', async (req: Request, res: Response) => {
    try {
        if (req.user) {
            if (req.body.code) {
                const codeInfo = authServices.verifyCode(req.body.code)

                if (codeInfo) {
                    await userController.updateFieldById(req.user.id, 'telegramid', codeInfo.telegramid)
                    bot.telegram.sendMessage(codeInfo.telegramid, `Sua conta está sincronizada com o email ${req.user.email}`)
                    cache.delete(req.body.code)

                    res.status(200).json({
                        success: 'Conta do Telegram sincronizada com sucesso',
                    })
                } else {
                    res.status(404).json({
                        error: 'Código de sincronização não encontrado ou expirado',
                    })
                }
            } else {
                res.status(400).json({
                    error: 'Código de sincronização faltando',
                })
            }
        } else {
            res.status(401).json({ error: 'Usuário não autenticado' })
        }
    } catch (err) {
        res.status(500).json({ error: err.message })
        logHandler.registerError(err)
    }
})

export default router
