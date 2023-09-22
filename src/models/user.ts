import { Schema, model } from 'mongoose';
import { IAuthModel } from '../types/entities/user';
import { omit } from 'lodash';

const emailRegexp = /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/;

const UserSchema: Schema = new Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        match: emailRegexp,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    token: {
        type: String,
        default: ''
    }
}, { timestamps: true });

UserSchema.method('sanitize', function (_model: IAuthModel) {
    const userData = this.toJSON({ virtuals: true });
    return {
        ...omit(userData, ['createdAt', 'updatedAt', '__v', '_id']),
    };
});

export const User = model<IAuthModel>('user', UserSchema);