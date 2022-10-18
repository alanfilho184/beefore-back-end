export default class RelatoryController {
    prisma: any;
    constructor(prisma: any);
    create(newRelatory: Relatory): Promise<any>;
    getByUserId(userid: number): Promise<any>;
    getAll(): Promise<any>;
    updateActionsByUserId(userid: number, newAction: Action): Promise<any>;
    deleteByUserId(userid: number): Promise<any>;
}
