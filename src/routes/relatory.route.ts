import { Router, Request, Response } from 'express'
import prisma from '../config/database'
import UserController from '../controllers/user.controller'
import ActualUsageController from '../controllers/actualUsage.controller'
import RelatoryController from '../controllers/relatory.controller'
import RelatoryServices from '../services/relatory.services'
import { Events as websocketEvents } from '../websocket'
import getRelatoryCode from '../utils/relatory/codeGenerator'
import LogHandler from '../logs'

const router = Router()
const userController = new UserController(prisma)
const actualUsageController = new ActualUsageController(prisma)
const relatoryController = new RelatoryController(prisma)
const relatoryServices = new RelatoryServices(relatoryController)
const logHandler = new LogHandler()

import bot from '../utils/telegram/bot'

import qrcode from 'qrcode'

router.post('/', async (req: Request, res: Response) => {
    try {
        if (req.headers.authorization === process.env.API_TOKEN) {
            if (!req.body.cardid) {
                return res.status(400).json({ error: 'ID do cartão faltando' })
            }
            const user = await userController.getByCardId(req.body.cardid)

            if (user) {
                const relatory = await relatoryController.getByUserId(user.id)
                const actions = relatoryServices.createAction(relatory ? relatory.actions : null)

                if (relatory) {
                    await relatoryController.updateActionsByUserId(user.id, actions.newAction)
                } else {
                    await relatoryController.create({
                        userid: user.id,
                        actions: actions.newAction,
                    })
                }

                if (user.preferences.sendActionReg && user.telegramid) {
                    bot.telegram.sendMessage(
                        user.telegramid,
                        `${actions.action} registrada
Olá, ${user.name}, este é seu comprovante de movimentação da Mambee
Ação: ${actions.action}
Data e Horário: ${actions.newActionDateTime.day} às ${actions.newActionDateTime.time}`,
                    )
                }

                if (actions.action == 'Entrada') {
                    actualUsageController.addOne(user.id).then(() => {
                        websocketEvents.emit('updateActualUsage')
                    })
                } else {
                    actualUsageController.removeOne(user.id).then(() => {
                        websocketEvents.emit('updateActualUsage')
                    })
                }

                websocketEvents.emit('actionReg', user, actions.action)

                res.status(200).json({ success: 'Ação adicionada' })
            } else {
                res.status(404).json({ error: 'Usuario não encontrado' })
            }
        } else {
            res.status(401).json({ error: 'Token de API inválido' })
        }
    } catch (err) {
        res.status(500).json({ error: 'Erro ao tentar registrar ação' })
        logHandler.registerError(err)
    }
})

router.post('/code/:code', async (req: Request, res: Response) => {
    try {
        if (req.user) {
            if (req.params.code == getRelatoryCode()) {
                const user = await userController.getById(req.user.id)

                if (user) {
                    const relatory = await relatoryController.getByUserId(user.id)
                    const actions = relatoryServices.createAction(relatory ? relatory.actions : null)

                    if (relatory) {
                        await relatoryController.updateActionsByUserId(user.id, actions.newAction)
                    } else {
                        await relatoryController.create({
                            userid: user.id,
                            actions: actions.newAction,
                        })
                    }

                    if (user.preferences.sendActionReg && user.telegramid) {
                        bot.telegram.sendMessage(
                            user.telegramid,
                            `${actions.action} registrada
Olá, ${user.name}, este é seu comprovante de movimentação da Mambee
Ação: ${actions.action}
Data e Horário: ${actions.newActionDateTime.day} às ${actions.newActionDateTime.time}`,
                        )
                    }

                    if (actions.action == 'Entrada') {
                        actualUsageController.addOne(user.id).then(() => {
                            websocketEvents.emit('updateActualUsage')
                        })
                    } else {
                        actualUsageController.removeOne(user.id).then(() => {
                            websocketEvents.emit('updateActualUsage')
                        })
                    }

                    websocketEvents.emit('actionReg', user, actions.action)

                    res.status(200).json({ success: 'Ação adicionada' })
                } else {
                    res.status(404).json({ error: 'Usuario não encontrado' })
                }
            } else {
                res.status(401).json({ error: 'Código incorreto' })
            }
        } else {
            res.status(401).json({ error: 'É necessário o login para utilizar este recurso' })
        }
    } catch (err) {
        res.status(500).json({ error: 'Erro ao tentar registrar ação' })
        logHandler.registerError(err)
    }
})

router.get('/code', async (req: Request, res: Response) => {
    try {
        if (req.user.email == process.env.QR_EMAIL) {
            const qr = await qrcode.toDataURL(`https://beefore.netlify.app/qrcode.html?code=${getRelatoryCode()}`, {
                errorCorrectionLevel: 'medium',
                scale: 20,
                type: 'image/webp',
            })

            res.status(200).json({ qrcode: qr })
        } else {
            res.status(403).json({ error: 'Esta rota é somente de uso interno' })
        }
    } catch (err) {
        res.status(500).json({ error: 'Erro ao gerar QR Code' })
        logHandler.registerError(err)
    }
})

router.get('/', async (req: Request, res: Response) => {
    try {
        if (req.user.type == 'Coordinator') {
            let userToGet
            const query: { id?: string; email?: string; cardid?: string; getAll?: string } = req.query

            if (query.email) {
                userToGet = await userController.getByEmail(query.email)
            } else if (query.id) {
                userToGet = await userController.getById(parseInt(query.id))
            } else if (query.cardid) {
                userToGet = await userController.getByCardId(query.cardid)
            }

            if (userToGet) {
                const relatory = await relatoryController.getByUserId(userToGet.id)

                if (relatory) {
                    res.status(200).json({
                        userid: relatory.userid,
                        actions: relatory.actions,
                        self: relatory.userid == req.user.id,
                    })
                } else {
                    res.status(404).json({
                        error: 'Nenhum relatório deste usuário',
                    })
                }
            } else {
                if (query.getAll) {
                    const relatory = await relatoryController.getAll()

                    res.status(200).json({ relatory })
                } else {
                    const relatory = await relatoryController.getByUserId(req.user.id)

                    if (relatory) {
                        res.status(200).json({
                            userid: relatory.userid,
                            actions: relatory.actions,
                            self: relatory.userid == req.user.id,
                        })
                    } else {
                        res.status(404).json({
                            error: 'Nenhum relatório encontrado',
                        })
                    }
                }
            }
        } else {
            const relatory = await relatoryController.getByUserId(req.user.id)

            if (relatory) {
                res.status(200).json({
                    userid: relatory.userid,
                    actions: relatory.actions,
                    self: relatory.userid == req.user.id,
                })
            } else {
                res.status(404).json({
                    error: 'Nenhum relatório deste usuário',
                })
            }
        }
    } catch (err) {
        res.status(500).json({ error: 'Erro ao tentar retornar relatório' })
        logHandler.registerError(err)
    }
})

export default router
