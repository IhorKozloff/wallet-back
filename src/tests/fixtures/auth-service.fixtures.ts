import { ObjectId } from 'bson';
import { User } from '../../models/user';
import { IUser, IUserDetails } from '../../types/entities/user';
import bcrypt from 'bcryptjs';
import { omit } from 'lodash';
import Token from '../../helpers/generateToken';


const unexistingObjectId = new ObjectId();

export const fakeData = {
    invalid: {
        email: 'email.com',
        password: '123'
    },
    unexisting: {
        email: 'unexistingEmail@gmail.com',
        objectId: unexistingObjectId,
        id: unexistingObjectId.toHexString(),
        password: '11122121122'
    }
};

export const defaultUser: IUser = {
    name: 'John',
    email: 'john@gmail.com',
    password: '1234567890'
};

export const existingUserAuthData: IUser = {
    ...omit(defaultUser, ['name'])
};

export const existingUserObjectId = new ObjectId();
const existingUserId = existingUserObjectId.toHexString();

const existingUserHashedPassword = bcrypt.hashSync(defaultUser.password, 10);
export const existingUserToken = Token.generateById(existingUserId);

export const existingUser: IUserDetails = {
    ...defaultUser,
    id: existingUserId,
    token: '',
    password: existingUserHashedPassword
};

export const setUsersInDB = async (users: IUserDetails[]) => {
    const preparedData = users.map(item => {
        return {
            ...omit(item, ['id']),
            _id: item.id,
        };
    });

    return User.insertMany(preparedData);
};

export const settings = {
    'new': true
};

export const setExistingUser = async () => {
    await setUsersInDB([
        existingUser
    ]);
};