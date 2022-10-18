"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const authorization_controller_1 = __importDefault(require("../controllers/authorization.controller"));
const router = (0, express_1.Router)();
const authorizationController = new authorization_controller_1.default(database_1.default);
router.get("/", async (req, res) => {
    try {
        if (req.user.type == "Coordinator") {
            const authorizations = await authorizationController.getAll();
            if (authorizations) {
                res.status(200).json(authorizations);
            }
            else {
                res.status(404).json({ error: "Nenhuma item para ser autorizado" });
            }
        }
        else {
            res.status(403).json({ error: "Somente o coordenador pode autorizar" });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error ao tentar retornar a lista de autorizações" });
    }
});
router.put("/", async (req, res) => {
    try {
        if (req.user.type == "Coordinator") {
            const authorization = await authorizationController.getById(req.body.id);
            if (authorization) {
                if (authorization.status == "Pending") {
                    if (req.body.status == "Approved") {
                        await authorizationController.approve(authorization);
                        res.status(200).json({ success: "Autorização aprovada com sucesso" });
                    }
                    else if (req.body.status == "Denied") {
                        await authorizationController.deny(authorization);
                        res.status(200).json({ success: "Autorização negada com sucesso" });
                    }
                    else {
                        res.status(400).json({ error: "Status inválido" });
                    }
                }
                else {
                    res.status(400).json({ error: "Autorização já foi aprovada ou negada" });
                }
            }
            else {
                res.status(404).json({ error: "Autorização não encontrada" });
            }
        }
        else {
            res.status(403).json({ error: "Somente coordenadores podem autorizar ou negar items" });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error ao tentar autorizar ou negar o item" });
    }
});
exports.default = router;
