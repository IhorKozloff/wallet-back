import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { UserDataRequest } from '../types/entities/user';

export class AuthController {

    static async login(req: UserDataRequest, res: Response, _next: NextFunction) {
        const { email, password } = req.body;

        const result = await AuthService.login({ email, password });
        res.status(200).json(result);
    }

    static async register(req: UserDataRequest, res: Response, _next: NextFunction) {
        const result = await AuthService.register(req.body);

        res.status(201).json({
            user: {
                ...result
            }
        });
    }

    static async logout(req: Request, res: Response, _next: NextFunction) {
        const { id } = req.user;

        await AuthService.logout(id);
        res.status(204).json();
    }
}