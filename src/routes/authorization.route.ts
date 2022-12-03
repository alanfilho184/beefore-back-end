import { Router, Request, Response } from 'express'
import prisma from '../config/database'
import AuthorizationController from '../controllers/authorization.controller'
import LogHandler from '../logs'

const router = Router()
const authorizationController = new AuthorizationController(prisma)
const logHandler = new LogHandler()

router.get('/', async (req: Request, res: Response) => {
    try {
        if (req.user.type == 'Coordinator') {
            const authorizations = await authorizationController.getAll()

            if (authorizations) {
                res.status(200).json(authorizations)
            } else {
                res.status(404).json({
                    error: 'Nenhum item para ser autorizado',
                })
            }
        } else {
            res.status(403).json({
                error: 'Somente o coordenador pode autorizar',
            })
        }
    } catch (err) {
        res.status(500).json({
            error: 'Error ao tentar retornar a lista de autorizações',
        })
        logHandler.registerError(err)
    }
})

router.put('/', async (req: Request, res: Response) => {
    try {
        if (req.user.type == 'Coordinator') {
            const authorization = await authorizationController.getById(parseInt(req.body.id))

            if (authorization) {
                if (authorization.status == 'Pending') {
                    if (req.body.status == 'Approved') {
                        await authorizationController.approve(authorization)
                        res.status(200).json({
                            success: 'Autorização aprovada com sucesso',
                        })
                    } else if (req.body.status == 'Denied') {
                        await authorizationController.deny(authorization)
                        res.status(200).json({
                            success: 'Autorização negada com sucesso',
                        })
                    } else {
                        res.status(400).json({ error: 'Status inválido' })
                    }
                } else {
                    res.status(400).json({
                        error: 'Autorização já foi aprovada ou negada',
                    })
                }
            } else {
                res.status(404).json({ error: 'Autorização não encontrada' })
            }
        } else {
            res.status(403).json({
                error: 'Somente coordenadores podem autorizar ou negar items',
            })
        }
    } catch (err) {
        res.status(500).json({
            error: 'Error ao tentar autorizar ou negar o item',
        })
        logHandler.registerError(err)
    }
})

export default router
