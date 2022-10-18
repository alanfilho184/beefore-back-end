import { PrismaClient } from '@prisma/client';
declare const prisma: PrismaClient<{
    datasources: {
        db: {
            url: any;
        };
    };
}, never, false>;
export declare const checkConnection: () => Promise<unknown>;
export default prisma;
