import { Router, Request, Response } from 'express'
import prisma from '../config/database'
import UserController from '../controllers/user.controller'
import ActualUsageController from '../controllers/actualUsage.controller'
import RelatoryController from '../controllers/relatory.controller'
import RelatoryServices from '../services/relatory.services'
import LogHandler from '../logs'

const router = Router()
const userController = new UserController(prisma)
const actualUsageController = new ActualUsageController(prisma)
const relatoryController = new RelatoryController(prisma)
const relatoryServices = new RelatoryServices(relatoryController)
const logHandler = new LogHandler()

import bot from '../utils/telegram/bot'

router.post('/', async (req: Request, res: Response) => {
    try {
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
                actualUsageController.addOne(user.id)
            } else {
                actualUsageController.removeOne(user.id)
            }

            res.status(200).json({ success: 'Ação adicionada' })
        } else {
            res.status(404).json({ error: 'Usuario não encontrado' })
        }
    } catch (err) {
        res.status(500).json({ error: 'Erro ao tentar registrar ação' })
        logHandler.registerError(err)
    }
})

router.get('/', async (req: Request, res: Response) => {
    try {
        const user = await userController.getById(req.user.id)

        if (user) {
            if (user.type == 'Coordinator') {
                let userToGet

                if (req.body.email) {
                    userToGet = await userController.getByEmail(req.body.email)
                } else if (req.body.id) {
                    userToGet = await userController.getById(req.body.id)
                } else if (req.body.cardid) {
                    userToGet = await userController.getByCardId(req.body.cardid)
                }

                if (userToGet) {
                    const relatory = await relatoryController.getByUserId(userToGet.id)

                    if (relatory) {
                        res.status(200).json({
                            userid: relatory.userid,
                            actions: relatory.actions,
                        })
                    } else {
                        res.status(404).json({
                            error: 'Nenhum relatório deste usuário',
                        })
                    }
                } else {
                    if (req.body.getAll) {
                        const relatory = await relatoryController.getAll()

                        res.status(200).json({ relatory })
                    } else {
                        const relatory = await relatoryController.getByUserId(req.user.id)

                        if (relatory) {
                            res.status(200).json({
                                userid: relatory.userid,
                                actions: relatory.actions,
                            })
                        } else {
                            res.status(404).json({
                                error: 'Nenhum relatório encontrado',
                            })
                        }
                    }
                }
            } else {
                const relatory = await relatoryController.getByUserId(user.id)

                if (relatory) {
                    res.status(200).json({
                        userid: relatory.userid,
                        actions: relatory.actions,
                    })
                } else {
                    res.status(404).json({
                        error: 'Nenhum relatório deste usuário',
                    })
                }
            }
        }
    } catch (err) {
        res.status(500).json({ error: 'Erro ao tentar retornar relatório' })
        logHandler.registerError(err)
    }
})

export default router
