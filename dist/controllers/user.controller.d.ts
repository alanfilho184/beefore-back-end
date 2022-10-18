export default class UserController {
    prisma: any;
    constructor(prisma: any);
    create(newUser: User): Promise<any>;
    getByEmail(email: string): Promise<any>;
    getByCardId(cardid: string): Promise<any>;
    getById(id: number): Promise<any>;
    getAll(): Promise<any>;
    updateById(userId: number, newUser: User): Promise<any>;
    updateFieldById(userId: number, field: string, value: string): Promise<any>;
    updatePreferencesById(userId: number, preference: string, value: string): Promise<any>;
    deleteById(userId: number): Promise<any>;
    deleteByEmail(email: string): Promise<any>;
    deleteByCardId(cardid: string): Promise<any>;
}
