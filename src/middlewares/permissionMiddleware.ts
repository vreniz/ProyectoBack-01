import { Request, Response, NextFunction } from 'express';
import { CustomRequest } from './authMiddleware';

export const checkPermissions = (requiredPermissions: string[]) => {
    return (req: CustomRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(403).json({ message: 'No tienes los permisos necesarios' });
            return;
        }

        if (!requiredPermissions.every(perm => req.user?.permissions.includes(perm))) {
            res.status(403).json({ message: 'No tienes los permisos necesarios' });
            return;
        }

        next();
    };
};
