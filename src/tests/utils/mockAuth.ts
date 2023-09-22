import { Request, Response, NextFunction } from 'express';
import { IUserAsRequest } from '../../types/entities/user';
import { AuthMiddlware } from '../../middlewares/authMiddleware';

export const mockReqAndNext = (user: Omit<IUserAsRequest, 'password' | 'token'>) => {
    jest.spyOn(AuthMiddlware, '_isUserAuthorized').mockImplementation(async (req: Request, res: Response, next: NextFunction) => {
        req.user = {
            name: user.name,
            email: user.email,
            id: user.id
        };
        return next();
    });
}