"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const relatory_controller_1 = __importDefault(require("../controllers/relatory.controller"));
const relatory_services_1 = __importDefault(require("../services/relatory.services"));
const router = (0, express_1.Router)();
const userController = new user_controller_1.default(database_1.default);
const relatoryController = new relatory_controller_1.default(database_1.default);
const relatoryServices = new relatory_services_1.default(relatoryController);
const bot_1 = __importDefault(require("../utils/telegram/bot"));
router.post('/', async (req, res) => {
    try {
        if (!req.body.cardid) {
            return res.status(400).json({ error: 'ID do cartão faltando' });
        }
        const user = await userController.getByCardId(req.body.cardid);
        if (user) {
            const relatory = await relatoryController.getByUserId(user.id);
            const actions = relatoryServices.createAction(relatory ? relatory.actions : null);
            if (relatory) {
                await relatoryController.updateActionsByUserId(user.id, actions.newAction);
            }
            else {
                await relatoryController.create({
                    userid: user.id,
                    actions: actions.newAction
                });
            }
            if (user.preferences.sendActionRegEmail && user.telegramid) {
                bot_1.default.telegram.sendMessage(user.telegramid, `${actions.action} registrada
Olá, ${user.name}, este é seu comprovante de movimentação da Mambee
Ação: ${actions.action}
Data e Horário: ${actions.newActionDateTime.day} às ${actions.newActionDateTime.time}`);
            }
            res.status(200).json({ success: 'Ação adicionada' });
        }
        else {
            res.status(404).json({ error: 'Usuario não encontrado' });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao tentar registrar ação' });
    }
});
router.get('/', async (req, res) => {
    try {
        let user = await userController.getById(req.user.id);
        if (user) {
            if (user.type == 'Coordinator') {
                let userToGet;
                if (req.body.email) {
                    userToGet = await userController.getByEmail(req.body.email);
                }
                else if (req.body.id) {
                    userToGet = await userController.getById(req.body.id);
                }
                else if (req.body.cardid) {
                    userToGet = await userController.getByCardId(req.body.cardid);
                }
                if (userToGet) {
                    const relatory = await relatoryController.getByUserId(userToGet.id);
                    if (relatory) {
                        res.status(200).json({ userid: relatory.userid, actions: relatory.actions });
                    }
                    else {
                        res.status(404).json({ error: 'Nenhum relatório deste usuário' });
                    }
                }
                else {
                    if (req.body.getAll) {
                        const relatory = await relatoryController.getAll();
                        res.status(200).json({ relatory });
                    }
                    else {
                        const relatory = await relatoryController.getByUserId(req.user.id);
                        if (relatory) {
                            res.status(200).json({ userid: relatory.userid, actions: relatory.actions });
                        }
                        else {
                            res.status(404).json({ error: 'Nenhum relatório encontrado' });
                        }
                    }
                }
            }
            else {
                const relatory = await relatoryController.getByUserId(user.id);
                if (relatory) {
                    res.status(200).json({ userid: relatory.userid, actions: relatory.actions });
                }
                else {
                    res.status(404).json({ error: 'Nenhum relatório deste usuário' });
                }
            }
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao tentar retornar relatório' });
    }
});
exports.default = router;
