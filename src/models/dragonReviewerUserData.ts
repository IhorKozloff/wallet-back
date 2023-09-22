import { Schema, model } from 'mongoose';
import { IDragonUserDataModel } from '../types/entities/dragon-reviewer';
import { omit } from 'lodash';

const DragonReviewerSchema: Schema = new Schema({

    email: {
        type: Schema.Types.String,
        require: true
    },
    favoritesIds: {
        type: [Schema.Types.String],
        default: []
    },
    avatar: {
        type: Schema.Types.String
    }

}, { timestamps: true });

DragonReviewerSchema.index({
    'email': 1,
}, { background: true });

DragonReviewerSchema.method('sanitize', function (_model: IDragonUserDataModel) {
    return omit(this.toJSON(), ['createdAt', '_id', '__v']);
});

export const DragonReviewerUserData = model<IDragonUserDataModel>('dragonReviewerUserData', DragonReviewerSchema);