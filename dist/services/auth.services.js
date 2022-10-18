"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_js_1 = __importDefault(require("crypto-js"));
const codeGenerator_1 = require("../utils/telegram/codeGenerator");
class AuthServices {
    constructor() { }
    comparePassword(password, hash) {
        return bcrypt_1.default.compareSync(password, hash);
    }
    createToken(user) {
        const payload = {
            id: user.id,
            email: user.email,
            name: user.name,
            preferences: user.preferences,
            type: user.type,
        };
        let token = jsonwebtoken_1.default.sign(payload, `${process.env.JWT_KEY}`);
        token = crypto_js_1.default.AES.encrypt(token, `${process.env.AES_KEY}`).toString();
        return token;
    }
    verifyToken(token) {
        token = crypto_js_1.default.AES.decrypt(token, `${process.env.AES_KEY}`).toString(crypto_js_1.default.enc.Utf8);
        const payload = jsonwebtoken_1.default.verify(token, `${process.env.JWT_KEY}`);
        if (typeof payload != 'string') {
            return payload;
        }
        else {
            return false;
        }
    }
    createRecoveryToken(user) {
        const payload = {
            id: user.id,
            email: user.email
        };
        let token = jsonwebtoken_1.default.sign(payload, `${process.env.JWT_KEY}`, { expiresIn: '1h' });
        token = crypto_js_1.default.AES.encrypt(token, `${process.env.AES_KEY}`).toString();
        return token;
    }
    verifyCode(code) {
        const codeInfo = codeGenerator_1.cache.get(code);
        if (codeInfo) {
            return codeInfo;
        }
        else {
            return false;
        }
    }
}
exports.default = AuthServices;
