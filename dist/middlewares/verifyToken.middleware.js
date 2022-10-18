"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const auth_services_1 = __importDefault(require("../services/auth.services"));
const authServices = new auth_services_1.default();
const excludeRoutes = ['POST|/auth/login', 'POST|/auth/recovery', 'POST|/user', 'POST|/relatory'];
function verifyToken(req, res, next) {
    if (!excludeRoutes.includes(`${req.method}|${req.path.endsWith('/') ? req.path.substring(0, req.path.length - 1) : req.path}`)) {
        if (!req.headers.authorization) {
            return res.status(401).json({ error: 'Token não encontrado', });
        }
        else {
            try {
                const user = authServices.verifyToken(req.headers.authorization);
                if (!user) {
                    return res.status(401).json({ error: 'Token inválido', });
                }
                else {
                    req.user = {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        preferences: user.preferences,
                        type: user.type,
                    };
                    next();
                }
            }
            catch (err) {
                console.error(err);
                return res.status(500).json({ error: 'Erro ao tentar validar token' });
            }
        }
    }
    else {
        return next();
    }
}
exports.verifyToken = verifyToken;
