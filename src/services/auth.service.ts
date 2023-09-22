import { User } from '../models/user';
import { AppError } from '../types/AppError';
import { IUser, IUserDetails } from '../types/entities/user';
import Token from '../helpers/generateToken';
import HashPassword from '../helpers/hashPassword';
import { errorMessages } from '../errors';
import { ObjectId } from 'bson';
import { omit } from 'lodash';

export class AuthService {

    static async login(userLoginData: IUser): Promise<Omit<IUserDetails, 'password'>> {
        const { email, password } = userLoginData;

        const user = await User.findOne({ email });

        if (!user) {
            throw new AppError(401, errorMessages.AUTH.EMAIL_NOT_FOUND);
        }

        const isPasswordValid = await HashPassword.validate(password, user.password);

        if (!isPasswordValid) {
            throw new AppError(401, errorMessages.AUTH.WRONG_PASSWORD);
        }

        const userId = user._id.toHexString();

        const token = Token.generateById(userId);

        const updatedUser = await User.findByIdAndUpdate(userId, { token }, { new: true });

        if (updatedUser === null) {
            throw new AppError(500, errorMessages.GENERAL.DATABASE_PROCESS_WAS_FAILED);
        }
        const updatedUserSanitize = updatedUser.sanitize();

        return omit(updatedUserSanitize, ['password']);
    }

    static async register(userRegisterData: IUser): Promise<Omit<IUserDetails, 'password'>> {
        const { name, email, password } = userRegisterData;

        const user = await User.findOne({ email });

        if (user !== null) {
            throw new AppError(409, errorMessages.AUTH.EMAIL_IN_USE);
        }
        const hashPassword = await HashPassword.hash(password, 10);

        const creatingUserData: IUser = {
            email,
            password: hashPassword
        }; 

        if(name) {
            creatingUserData.name = name; 
        }

        const createdUser = await User.create(creatingUserData);

        const sanitazedCreatedResult = createdUser.sanitize();

        return {
            ...omit(sanitazedCreatedResult, ['password']),
        };
    }

    static async logout(userId: ObjectId): Promise<Omit<IUserDetails, 'password'>> {
     
        const updatedUser = await User.findByIdAndUpdate(userId, { token: '' }, { new: true });

        if (updatedUser === null) {
            throw new AppError(500, errorMessages.GENERAL.DATABASE_PROCESS_WAS_FAILED);
        }
        const updatedUserSanitize = updatedUser.sanitize();

        return {...omit(updatedUserSanitize, ['password'])};
    }
}