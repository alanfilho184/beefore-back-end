import { Events as websocketEvents } from '../../websocket'

let code: string

function generateCode() {
    let newCode = ''

    do {
        const length = 16
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

        for (let i = 0, n = charset.length; i < length; ++i) {
            newCode += charset.charAt(Math.floor(Math.random() * n))
        }
    } while (newCode == code)

    code = newCode
    websocketEvents.emit('refreshQRCode', code)
}

function getCode() {
    return code
}

if (process.env.QR_CODE == 'true') {
    generateCode()
    setInterval(generateCode, 1000 * 60 * 60)
} else {
    code = process.env.RELATORY_CODE!
}

export default getCode
