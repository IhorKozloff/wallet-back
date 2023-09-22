import { ObjectId } from 'bson';
import { Document } from 'mongoose';
import { Request } from 'express';
import { ModelSanitize } from '../sanitize';

export interface IUser {
    name?: string;
    email: string;
    password: string;
}

export interface IUserDetails extends IUser {
    id: string;
    token: string;
}

export interface IUserAsRequest extends Omit<IUser, 'password'> {
    id: ObjectId
}

export type UserDataToUpdate = Partial<Omit<IUserDetails, 'id'>>

export type UserDataRequest = Request<object, object, IUser>

export interface ModelSanitizeDetails<T> {
    sanitizeDetails: () => T;
}

export interface IAuthModel extends Document<ObjectId>, Omit<IUserDetails, 'id'>, ModelSanitize<IUserDetails> {

}