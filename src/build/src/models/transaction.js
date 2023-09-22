"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const mongoose_1 = require("mongoose");
const transaction_1 = require("../types/entities/transaction");
const lodash_1 = require("lodash");
const dateSchema = new mongoose_1.Schema({
    day: { type: Number, require: true },
    month: { type: Number, require: true },
    year: { type: Number, require: true }
});
const TransactionSchema = new mongoose_1.Schema({
    date: dateSchema,
    type: { type: mongoose_1.Schema.Types.String, enum: transaction_1.KnownTransactionTypes, required: true },
    category: { type: mongoose_1.Schema.Types.String, enum: transaction_1.KnownTransactionCategories, required: true },
    comment: { type: mongoose_1.Schema.Types.String },
    sum: { type: mongoose_1.Schema.Types.Number, required: true },
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'user' }
}, { timestamps: true });
TransactionSchema.method('sanitize', function (_model) {
    const data = this.toJSON({ virtuals: true });
    return Object.assign({}, (0, lodash_1.omit)(data, ['createdAt', 'updatedAt', '__v', '_id', 'owner', 'date._id', 'date.id']));
});
exports.Transaction = (0, mongoose_1.model)('transaction', TransactionSchema);
