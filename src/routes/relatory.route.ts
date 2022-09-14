import { Router } from 'express';
import prisma from '../config/database'
import UserController from '../controllers/user.controller'
import RelatoryController from '../controllers/relatory.controller';
import RelatoryServices from '../services/relatory.services';

const router = Router()
const userController = new UserController(prisma)
const relatoryController = new RelatoryController(prisma)
const relatoryServices = new RelatoryServices(relatoryController)

router.post('/', async (req, res) => {
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
            }
            else {
                await relatoryController.create({
                    userid: user.id,
                    actions: actions.newAction
                })
            }

            // if (user.preferences.sendActionRegEmail) {
            //     app.mailer.sendActionRegisteredEmail(user, actions)
            // }

            res.status(200).json({ success: 'Ação adicionada' })
        }
        else {
            res.status(404).json({ error: 'Usuario não encontrado' })
        }
    }
    catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Erro ao tentar registrar ação' })
    }
})

router.get('/', async (req, res) => {
    try {
        let user = await userController.getById(req.user.id)

        if (user) {
            if (user.type == 'Coordinator') {
                let userToGet

                if (req.body.email) {
                    userToGet = await userController.getByEmail(req.body.email)
                }
                else if (req.body.id) {
                    userToGet = await userController.getById(req.body.id)
                }
                else if (req.body.cardid) {
                    userToGet = await userController.getByCardId(req.body.cardid)
                }

                if (userToGet) {
                    const relatory = await relatoryController.getByUserId(userToGet.id)

                    if (relatory) {
                        res.status(200).json({ userid: relatory.userid, actions: relatory.actions })
                    }
                    else {
                        res.status(404).json({ error: 'Nenhum relatório deste usuário' })
                    }
                }
                else {
                    if (req.body.getAll) {
                        const relatory = await relatoryController.getAll()

                        res.status(200).json({ relatory })
                    }
                    else {
                        const relatory = await relatoryController.getByUserId(req.user.id)

                        if (relatory) {
                            res.status(200).json({ userid: relatory.userid, actions: relatory.actions })
                        }
                        else {
                            res.status(404).json({ error: 'Nenhum relatório encontrado' })
                        }

                    }
                }
            }
            else {
                const relatory = await relatoryController.getByUserId(user.id)

                if (relatory) {
                    res.status(200).json({ userid: relatory.userid, actions: relatory.actions })
                }
                else {
                    res.status(404).json({ error: 'Nenhum relatório deste usuário' })
                }
            }
        }
    }
    catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Erro ao tentar retornar relatório' })
    }
})

export default router