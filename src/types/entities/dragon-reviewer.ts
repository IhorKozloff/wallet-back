import { ObjectId } from 'bson';
import { Document } from 'mongoose';
import { Request } from 'express';
import { ModelSanitize } from '../sanitize';

export interface IUserData {
    email: string,
    favoritesIds: ObjectId[],
    avatar: string
}

export interface IDragonUserDataModel extends Document<ObjectId>, IUserData, ModelSanitize<IUserData> {}

export type DataToUpdate = Partial<Omit<IUserData, 'email'>>

export type GetUserDragonRequest = Request<object, object, object,Pick<IUserData, 'email'>>