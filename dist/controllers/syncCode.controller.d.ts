export default class SyncCodeController {
    prisma: any;
    constructor(prisma: any);
    create(syncCode: SyncCode): Promise<any>;
    getAll(): Promise<any>;
    getById(id: number): Promise<any>;
    getByCode(code: string): Promise<any>;
    getByTelegramId(telegramid: string): Promise<any>;
    deleteById(id: number): Promise<any>;
    deleteByCode(code: string): Promise<any>;
    deleteAllExpired(): Promise<any>;
}
