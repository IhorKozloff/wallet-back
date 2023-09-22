import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { AppError } from '../types/AppError';
import httpStatus from 'http-status';

export const validateParams = (dataType: 'body' | 'params' | 'query', rules: Schema) => {

    const func = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = await rules.validateAsync(req[dataType]);
            req[dataType] = validated;
            next();
        } catch (error: any) {
            if (error.isJoi) {
                const { details } = error;
                const message = details.map(item => item.message).join(',');

                const newError = new AppError(httpStatus.BAD_REQUEST, message)
                return next(newError)
            }
            const newError = new AppError(httpStatus.BAD_REQUEST, 'validation failed')
            return next(newError)
        }
    };

    return func;
};