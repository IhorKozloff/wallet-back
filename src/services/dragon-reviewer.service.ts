import { DragonReviewerUserData } from '../models/dragonReviewerUserData';
import { IUserData, DataToUpdate } from '../types/entities/dragon-reviewer';

export class DragonReviewerService {

    static async findUserDataByEmail(email: string): Promise<IUserData | null> {
        const userData = await DragonReviewerUserData.findOne({ email });
        if (userData) {
            return {
                email: userData.email,
                favoritesIds: userData.favoritesIds,
                avatar: userData.avatar
            };
        } else {
            return null;
        }
    }

    static async createUserData(data: IUserData): Promise<IUserData> {
        const result = await DragonReviewerUserData.create(data);
        return result.sanitize();
    }

    static async updateUserDataByEmail(email: string, newData: DataToUpdate): Promise<IUserData | null> {
        const result = await DragonReviewerUserData.findOneAndUpdate({ email: email }, newData, { new: true });
        return result ? result.sanitize() : null;
    }

    static async processUserData(data: IUserData) {
        const { email, ...rest } = data;

        const isUser = await DragonReviewerService.findUserDataByEmail(email);

        if (isUser) {
            return await DragonReviewerService.updateUserDataByEmail(email, rest);
        } else {
            return await DragonReviewerService.createUserData(data);
        }
    }
}