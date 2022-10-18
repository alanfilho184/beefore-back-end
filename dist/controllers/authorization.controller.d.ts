export default class AuthorizationController {
    prisma: any;
    constructor(prisma: any);
    getAll(type?: AuthorizationTypes): Promise<any>;
    getById(id: number): Promise<any>;
    getByUserId(userId: number): Promise<any>;
    create(authorization: Authorization): Promise<any>;
    updateFieldById(id: number, field: string, value: string): Promise<any>;
    deleteById(id: number): Promise<any>;
    approve(authorization: Authorization): Promise<unknown>;
    deny(authorization: Authorization): Promise<any>;
}
