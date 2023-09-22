import { Schema, model } from 'mongoose';
import { KnownTransactionTypes, KnownTransactionCategories, TransactionModel } from '../types/entities/transaction';
import { omit } from 'lodash';

const dateSchema: Schema = new Schema({
    day: { type: Number, require: true },
    month: { type: Number, require: true },
    year: { type: Number, require: true }
});

const TransactionSchema: Schema = new Schema({
    date: dateSchema,
    type: { type: Schema.Types.String, enum: KnownTransactionTypes, required: true },
    category: { type: Schema.Types.String, enum: KnownTransactionCategories, required: true },
    comment: { type: Schema.Types.String },
    sum: { type: Schema.Types.Number, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'user' }
}, { timestamps: true });

TransactionSchema.method('sanitize', function (_model: TransactionModel) {
    const data = this.toJSON({ virtuals: true });
    return {
        ...omit(data, ['createdAt', 'updatedAt', '__v', '_id', 'owner', 'date._id', 'date.id']),
    };
});

export const Transaction = model<TransactionModel>('transaction', TransactionSchema);
