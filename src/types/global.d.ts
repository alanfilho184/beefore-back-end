export {}

declare global {
    type UserTypes = 'Coordinator' | 'Member' | 'Visitor'
    type AuthorizationTypes = 'User' | 'Reservation'
    type AuthorizationStatus = 'Pending' | 'Approved' | 'Denied'
    type EquipamentStatus = 'Avaliable' | 'Reserved'
    type Action = 'Entrada' | 'Saida'

    type Preferences = {
        sendActionReg: boolean
    }

    type User = {
        id: number
        cardid?: string
        name: string
        email: string
        password: string
        telegramid?: string
        occupation?: string
        type: UserTypes
        preferences: Preferences
        profileimage?: string
    }

    type Authorization = {
        id?: number
        userid?: number
        type: AuthorizationTypes
        status: AuthorizationStatus
        laststatustime: string
        data: User | Reservation
    }

    type Relatory = {
        id?: number
        userid: number
        actions: Actions
    }

    type Actions = {
        [time: string]: object
    }

    type SyncCode = {
        id?: number
        code: string
        telegramid: string
        expiration: Date
    }

    namespace Express {
        interface Request {
            startTime: number
            user: {
                id: number
                email: string
                name: string
                preferences: object
                type: UserTypes
            }
        }
    }
}
