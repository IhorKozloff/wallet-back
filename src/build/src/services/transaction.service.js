"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsService = void 0;
const AppError_1 = require("../types/AppError");
const user_1 = require("../models/user");
const transaction_1 = require("../models/transaction");
const errors_1 = require("../errors");
const node_util_1 = __importDefault(require("node:util"));
const lodash_1 = require("lodash");
const http_status_1 = __importDefault(require("http-status"));
class TransactionsService {
    static findByOwner(ownerData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, id: ownerId } = ownerData;
            const transactions = yield transaction_1.Transaction.find({ owner: ownerId });
            if (transactions.length === 0) {
                return [];
            }
            return transactions.map(item => {
                const sanitizedItem = item.sanitize();
                const owner = {
                    email
                };
                if (name) {
                    owner.name = name;
                }
                return Object.assign(Object.assign({}, sanitizedItem), { owner });
            });
        });
    }
    static delete(ownerId, transactionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingTransaction = yield transaction_1.Transaction.find({ owner: ownerId, _id: transactionId });
            if (existingTransaction.length === 0) {
                throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, node_util_1.default.format(errors_1.errorMessages.TRANSACTIONS.TRANSACTION_NOT_FOUND, transactionId));
            }
            const removingItem = yield transaction_1.Transaction.findByIdAndRemove(transactionId);
            if (!removingItem) {
                throw new AppError_1.AppError(http_status_1.default.INTERNAL_SERVER_ERROR, errors_1.errorMessages.GENERAL.DATABASE_PROCESS_WAS_FAILED);
            }
            return removingItem.sanitize();
        });
    }
    static add(ownerId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentUser = yield user_1.User.findById(ownerId);
            if (!currentUser) {
                throw new AppError_1.AppError(404, errors_1.errorMessages.AUTH.USER_IS_NOT_FOUND);
            }
            const createdTransaction = yield transaction_1.Transaction.create(Object.assign({ owner: ownerId }, data));
            const transactionData = createdTransaction.sanitize();
            const owner = {
                email: currentUser.email
            };
            if (currentUser.name) {
                owner.name = currentUser.name;
            }
            return Object.assign(Object.assign({}, transactionData), { owner });
        });
    }
    static _filter(ownerId, filterParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const { month, year } = filterParams;
            const noIncomeSumObj = { _id: 'incomeSum', total: 0 };
            if (month === 'all' && year === 'all') {
                const expense = yield transaction_1.Transaction.aggregate([
                    { $match: { owner: ownerId, type: 'expense' } },
                    { $project: { _id: false, category: true, sum: true } },
                    { $group: { _id: '$category', total: { $sum: '$sum' } } }
                ]);
                const [income] = yield transaction_1.Transaction.aggregate([
                    { $match: { owner: ownerId, type: 'income' } },
                    { $project: { _id: false, category: true, date: true, sum: true } },
                    { $group: { _id: 'incomeSum', total: { $sum: '$sum' } } }
                ]);
                const result = {
                    expense,
                    income: income || noIncomeSumObj
                };
                return result;
            }
            if (month !== 'all' && year === 'all') {
                const expense = yield transaction_1.Transaction.aggregate([
                    { $match: { owner: ownerId, type: 'expense', 'date.month': +month } },
                    { $project: { _id: false, category: true, sum: true } },
                    { $group: { _id: '$category', total: { $sum: '$sum' } } }
                ]);
                const [income] = yield transaction_1.Transaction.aggregate([
                    { $match: { owner: ownerId, type: 'income', 'date.month': +month } },
                    { $project: { _id: false, category: true, sum: true } },
                    { $group: { _id: 'incomeSum', total: { $sum: '$sum' } } }
                ]);
                const result = {
                    expense,
                    income: income || noIncomeSumObj
                };
                return result;
            }
            if (month === 'all' && year !== 'all') {
                const expense = yield transaction_1.Transaction.aggregate([
                    { $match: { owner: ownerId, type: 'expense', 'date.year': +year } },
                    { $project: { _id: false, category: true, sum: true } },
                    { $group: { _id: '$category', total: { $sum: '$sum' } } }
                ]);
                const [income] = yield transaction_1.Transaction.aggregate([
                    { $match: { owner: ownerId, type: 'income', 'date.year': +year } },
                    { $project: { _id: false, category: true, sum: true } },
                    { $group: { _id: 'incomeSum', total: { $sum: '$sum' } } }
                ]);
                const result = {
                    expense,
                    income: income || noIncomeSumObj
                };
                return result;
            }
            if (month !== 'all' && year !== 'all') {
                const expense = yield transaction_1.Transaction.aggregate([
                    { $match: { owner: ownerId, type: 'expense', 'date.month': +month, 'date.year': +year } },
                    { $project: { _id: false, category: true, sum: true } },
                    { $group: { _id: '$category', total: { $sum: '$sum' } } }
                ]);
                const [income] = yield transaction_1.Transaction.aggregate([
                    { $match: { owner: ownerId, type: 'income', 'date.month': +month, 'date.year': +year } },
                    { $project: { _id: false, category: true, sum: true } },
                    { $group: { _id: 'incomeSum', total: { $sum: '$sum' } } }
                ]);
                const result = {
                    expense,
                    income: income || noIncomeSumObj
                };
                return result;
            }
            else {
                return null;
            }
        });
    }
    static getStatisticCategory(ownerId, filterParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const queryResult = yield TransactionsService._filter(ownerId, filterParams);
            if (!queryResult) {
                return {
                    expense: [],
                    income: {
                        total: 0
                    }
                };
            }
            const result = {
                expense: queryResult.expense.map(item => {
                    return Object.assign(Object.assign({}, (0, lodash_1.omit)(item, '_id')), { categoryType: item._id });
                }),
                income: Object.assign({}, (0, lodash_1.omit)(queryResult.income, '_id'))
            };
            return result;
        });
    }
}
exports.TransactionsService = TransactionsService;
