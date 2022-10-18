import jwt from 'jsonwebtoken';
export default class AuthServices {
    constructor();
    comparePassword(password: string, hash: string): boolean;
    createToken(user: User): string;
    verifyToken(token: string): false | jwt.JwtPayload;
    createRecoveryToken(user: User): string;
    verifyCode(code: string): SyncCode | false;
}
