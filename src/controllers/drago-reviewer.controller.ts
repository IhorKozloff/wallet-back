import { Request, Response } from 'express';
import { GetUserDragonRequest } from '../types/entities/dragon-reviewer';
import { DragonReviewerService } from '../services/dragon-reviewer.service';
import httpStatus from 'http-status';

export default class DragonReviewerUserDataController {

    static async addUserData(req: Request, res: Response) {

        const result = await DragonReviewerService.processUserData(req.body);

        res.status(httpStatus.OK).json(result);
    }

    static async getUserData(req: GetUserDragonRequest, res: Response) {
        const { email } = req.query;

        const result = await DragonReviewerService.findUserDataByEmail(email);

        res.status(httpStatus.OK).json(result);
    }
}