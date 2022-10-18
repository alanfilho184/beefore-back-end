"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const auth_services_1 = __importDefault(require("../services/auth.services"));
const user_services_1 = __importDefault(require("../services/user.services"));
const bot_1 = __importDefault(require("../utils/telegram/bot"));
const codeGenerator_1 = require("../utils/telegram/codeGenerator");
const router = (0, express_1.Router)();
const userController = new user_controller_1.default(database_1.default);
const userServices = new user_services_1.default(user_controller_1.default);
const authServices = new auth_services_1.default();
router.post('/login', async (req, res) => {
    try {
        if (req.body.password && req.body.email) {
            let user = await userController.getByEmail(req.body.email);
            if (user) {
                if (authServices.comparePassword(req.body.password, user.password)) {
                    const token = authServices.createToken(user);
                    res.status(200).json({ token: token });
                }
                else {
                    res.status(401).json({ error: 'Senha incorreta' });
                }
            }
            else {
                res.status(404).json({ error: 'Usuário não encontrado' });
            }
        }
        else {
            res.status(400).json({ error: 'Dados faltando ou incorretos' });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao tentar autenticar' });
    }
});
router.post('/recovery', async (req, res) => {
    try {
        if (req.body.email && !req.body.token) {
            let user = await userController.getByEmail(req.body.email);
            if (user) {
                return res.status(501).end();
                const token = authServices.createRecoveryToken(user);
            }
            else {
                res.status(404).json({ error: 'Usuário não encontrado' });
            }
        }
        else if (req.body.token && !req.body.email) {
            let token = authServices.verifyToken(req.body.token);
            if (req.body.password) {
                if (token != false) {
                    const user = await userController.getById(token.id);
                    if (user) {
                        const newPassword = userServices.hashPassword(req.body.password);
                        await userController.updateFieldById(user.id, 'password', newPassword);
                        res.status(200).json({ success: 'Senha alterada com sucesso' });
                    }
                    else {
                        res.status(404).json({ error: 'Usuário não encontrado' });
                    }
                }
            }
            else {
                res.status(400).json({ error: 'Nova senha não encontrada' });
            }
        }
        else {
            res.status(400).json({ error: 'Dados faltando ou incorretos' });
        }
    }
    catch (err) {
        if (err.name = 'TokenExpiredError') {
            res.status(401).json({ error: 'Token expirado' });
        }
        else if (err.name = 'JsonWebTokenError') {
            res.status(401).json({ error: 'Token inválido' });
        }
        else {
            console.error(err);
            res.status(500).json({ error: 'Erro ao tentar enviar email de recuperação' });
        }
    }
});
router.post('/sincronizar', async (req, res) => {
    try {
        if (req.user) {
            if (req.body.code) {
                const codeInfo = authServices.verifyCode(req.body.code);
                if (codeInfo) {
                    await userController.updateFieldById(req.user.id, 'telegramid', codeInfo.telegramid);
                    bot_1.default.telegram.sendMessage(codeInfo.telegramid, `Sua conta está sincronizada com o email ${req.user.email}`);
                    codeGenerator_1.cache.delete(req.body.code);
                    res.status(200).end({ success: "Conta do Telegram sincronizada com sucesso" });
                }
                else {
                    res.status(404).end({ error: "Código de sincronização não encontrado ou expirado" });
                }
            }
            else {
                res.status(400).end({ error: "Código de sincronização faltando" });
            }
        }
        else {
            res.status(401).end({ error: "Usuário não autenticado" });
        }
    }
    catch (err) {
        res.status(500).end({ error: err.message });
    }
});
exports.default = router;
