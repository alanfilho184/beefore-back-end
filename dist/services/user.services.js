"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const userType = ['Coordinator', 'Member', 'Visitor'];
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}
class DuplicationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'DuplicationError';
    }
}
class UserServices {
    constructor(User) {
        this.User = User;
    }
    hashPassword(password) {
        return bcrypt_1.default.hashSync(password, 10);
    }
    validateNewUser(newUser) {
        if (!newUser.name || !newUser.name.match(/^[a-zA-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ]{2,}(?: [a-zA-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ]+){0,8}$/g)) {
            throw new ValidationError('Nome inválido');
        }
        if (!newUser.email || !newUser.email.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/g)) {
            throw new ValidationError('Email inválido');
        }
        if (!newUser.type || !userType.includes(newUser.type)) {
            throw new ValidationError('Tipo inválido');
        }
        if (!newUser.password) {
            throw new ValidationError('Senha inválida');
        }
        if (newUser.type == 'Member' && !newUser.cardid?.match(/(^(\d){10})$/g)) {
            throw new ValidationError('ID do cartão inválido');
        }
    }
    async verifyDuplicate(newUser) {
        let user = await this.User.getByEmail(newUser.email);
        if (user) {
            throw new DuplicationError('Email já cadastrado');
        }
        if (newUser.cardid) {
            user = await this.User.getByCardId(newUser.cardid);
            if (user) {
                throw new DuplicationError('Cartão já cadastrado');
            }
        }
    }
    async verifyDuplicateModified(newUser) {
        let user = await this.User.getByEmail(newUser.email);
        if (user && user.id != newUser.id) {
            throw new DuplicationError('Email já cadastrado');
        }
        if (newUser.cardid) {
            user = await this.User.getByCardId(newUser.cardid);
            if (user && user.id != newUser.id) {
                throw new DuplicationError('Cartão já cadastrado');
            }
        }
    }
}
exports.default = UserServices;
