import { Router, Request, Response } from 'express'
import prisma from '../config/database'
import UserController from '../controllers/user.controller'
import AuthorizationController from '../controllers/authorization.controller'
import UserServices from '../services/user.services'
import { DateTime as time } from 'luxon'
import LogHandler from '../logs'

const router = Router()
const userController = new UserController(prisma)
const authorizationController = new AuthorizationController(prisma)
const userServices = new UserServices(userController)
const logHandler = new LogHandler()

router.post('/', async (req: Request, res: Response) => {
    try {
        userServices.validateNewUser(req.body)
        await userServices.verifyDuplicate(req.body)
        req.body.password = userServices.hashPassword(req.body.password)

        if (req.body.type == 'Coordinator' || req.body.type == 'Member') {
            const authorization = await authorizationController.create({
                status: 'Pending',
                laststatustime: `${time.local({ zone: 'America/Fortaleza' }).toFormat('dd/MM/yyyy|HH:mm:ss')}`,
                type: 'User',
                data: req.body,
            })

            res.status(201).json({ id: authorization.id })
        } else {
            const user = await userController.create(req.body)
            res.status(201).json({ id: user.id })
        }
    } catch (err) {
        if (err.name == 'ValidationError' || err.name == 'DuplicationError') {
            res.status(400).json({ error: err.message })
        } else {
            res.status(500).json({ error: 'Erro ao tentar cadastrar' })
            logHandler.registerError(err)
        }
    }
})

router.get('/', async (req: Request, res: Response) => {
    try {
        let user

        if (req.user.type == 'Coordinator') {
            if (req.body.email) {
                user = await userController.getByEmail(req.body.email)
            } else if (req.body.id) {
                user = await userController.getById(req.body.id)
            } else if (req.body.cardid) {
                user = await userController.getByCardId(req.body.cardid)
            } else if (req.body.getAll) {
                const users = await userController.getAll()

                const allUsers: Array<object> = []
                users.forEach((user: User) => {
                    allUsers.push({
                        id: user.id,
                        cardid: user.cardid || null,
                        name: user.name,
                        email: user.email,
                        profileimage: user.profileimage,
                        occupation: user.occupation,
                        type: user.type,
                    })
                })

                return res.status(200).json(allUsers)
            } else {
                user = await userController.getById(req.user.id)
            }
        } else {
            user = await userController.getById(req.user.id)
        }

        if (!user) {
            res.status(404).json({ error: 'Usuário não encontrado' })
        } else {
            res.status(200).json({
                id: user.id,
                cardid: user.cardid ? user.cardid : null,
                name: user.name,
                email: user.email,
                occupation: user.occupation,
                type: user.type,
                profileimage: user.profileimage ? user.profileimage : null,
                preferences: user.preferences,
            })
        }
    } catch (err) {
        res.status(500).json({ error: 'Erro ao tentar retornar usuário' })
        logHandler.registerError(err)
    }
})

router.patch('/', async (req: Request, res: Response) => {
    try {
        const user = await userController.getById(req.user.id)

        if (!user) {
            res.status(404).json({ error: 'Usuário não encontrado' })
        } else {
            if (req.body.modify.password) {
                req.body.modify.password = userServices.hashPassword(req.body.modify.password)
            }

            if (req.body.modify.id) {
                delete req.body.modify.id
            }

            const newUser = Object.assign({}, user, req.body.modify)

            userServices.validateNewUser(newUser)
            await userServices.verifyDuplicateModified(newUser)

            await userController.updateById(user.id, newUser)
            res.status(200).json({ success: 'Usuário atualizado' })
        }
    } catch (err) {
        if (err.name == 'ValidationError' || err.name == 'DuplicationError') {
            res.status(400).json({ error: err.message })
        } else {
            res.status(500).json({ error: 'Erro ao tentar modificar usuário' })
            logHandler.registerError(err)
        }
    }
})

router.delete('/', async (req: Request, res: Response) => {
    try {
        if (await userController.getById(req.user.id)) {
            await userController.deleteById(req.user.id)
            res.status(200).json({ success: 'Usuário deletado' })
        } else {
            res.status(404).json({ error: 'Usuário não encontrado' })
        }
    } catch (err) {
        res.status(500).json({ error: 'Erro ao tentar deletar usuário' })
        logHandler.registerError(err)
    }
})

export default router
