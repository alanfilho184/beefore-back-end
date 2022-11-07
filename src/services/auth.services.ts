import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { cache } from '../utils/telegram/codeGenerator'

export default class AuthServices {
    comparePassword(password: string, hash: string) {
        return bcrypt.compareSync(password, hash)
    }

    createToken(user: User) {
        const payload = {
            id: user.id
        }

        let token = jwt.sign(payload, `${process.env.JWT_KEY}`, { expiresIn: '7d' })

        return token
    }

    verifyToken(token: string) {
        try {
            const payload = jwt.verify(token, `${process.env.JWT_KEY}`)
            if (typeof payload != 'string') {
                return payload
            }
            else {
                return false
            }
        }
        catch (err) {
            return false
        }
    }

    verifyCode(code: string): SyncCode | false {
        const codeInfo = cache.get(code)

        if (codeInfo) {
            return codeInfo
        }
        else {
            return false
        }
    }
}