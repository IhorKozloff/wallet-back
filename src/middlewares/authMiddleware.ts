
import jwt from 'jsonwebtoken';
import { Response, Request, NextFunction } from 'express';
import { User } from '../models/user';
import { AppError } from '../types/AppError';
import { errorMessages } from '../errors';
import httpStatus from 'http-status';

const { SECRET_KEY } = process.env;

interface JwtPayload extends jwt.JwtPayload {
    id: string
}

export class AuthMiddlware {

    static async _isUserAuthorized (req: Request, res: Response, next: NextFunction) {

        const { authorization } = req.headers;
    
        if (authorization) {
            const [bearer, token] = authorization.split(' ');
    
            if (bearer !== 'Bearer') {
                const newError = new AppError(httpStatus.UNAUTHORIZED, errorMessages.AUTH.AUTHORIZATION_HEADER_NOT_BEGIN_BEARER);
                return next(newError);
            }

            if (!token) {
                const newError = new AppError(httpStatus.UNAUTHORIZED, errorMessages.AUTH.TOKEN_IS_BAD);
                return next(newError);
            }
    
            let userId: string | undefined;
            try {
                const { id } = jwt.verify(token, SECRET_KEY) as JwtPayload;
                userId = id;
            } catch (err) {
                const newError = new AppError(httpStatus.UNAUTHORIZED, errorMessages.AUTH.TOKEN_IS_BAD);
                return next(newError);
            }
            
            if (!userId) {
                const newError = new AppError(httpStatus.UNAUTHORIZED, errorMessages.AUTH.TOKEN_IS_BAD);
                return next(newError);
            }
    
            const user = await User.findById(userId);
    
            if (user) {
                req.user = {
                    id: user._id,
                    name: user.name,
                    email: user.email
                };
                return next();
            } else {
                const newError = new AppError(httpStatus.UNAUTHORIZED, errorMessages.AUTH.NOT_AUTHORIZED);
                return next(newError);
            }
    
        } else {
            const newError = new AppError(httpStatus.UNAUTHORIZED, errorMessages.AUTH.INVALID_AUTH_HEADER);
            return next(newError);
        }
    }

    static async isUserAuthorized (req: Request, res: Response, next: NextFunction) {
        return AuthMiddlware._isUserAuthorized(req, res, next);
    }
}
