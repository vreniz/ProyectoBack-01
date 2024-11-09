import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/userModel';

export interface CustomRequest extends Request {
    user?: {
        id: string;
        role: string;
        permissions: string[];
    };
}

export const authenticateToken = (req: CustomRequest, res: Response, next: NextFunction): void => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        res.status(401).send('Access Denied');
        return;
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || '') as CustomRequest['user'];
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).send('Invalid Token');
        return;
    }
};

export const authorizeRole = (roles: string[]) => {
    return (req: CustomRequest, res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).send('Access Denied');
            return;
        }
        next();
    };
};
