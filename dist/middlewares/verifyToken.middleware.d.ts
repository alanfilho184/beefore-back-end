import { Request, Response, NextFunction } from 'express';
export declare function verifyToken(req: Request, res: Response, next: NextFunction): void | Response<any, Record<string, any>>;
