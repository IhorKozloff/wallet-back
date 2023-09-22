import { AppError } from '../types/AppError';
import { ITransaction, IFilterParams, ITransactionDetails, IOwner, IFilterQueryResult, IStatisticCategories } from '../types/entities/transaction';
import { User } from '../models/user';
import { Transaction } from '../models/transaction';
import { IUserAsRequest } from '../types/entities/user';
import { ObjectId } from 'bson';
import { errorMessages } from '../errors';
import { omit } from 'lodash';
import httpStatus from 'http-status';

export class TransactionsService {

    static async findByOwner(ownerData: IUserAsRequest): Promise<ITransactionDetails[]> {
        const { name, email, id: ownerId } = ownerData;
        
        const transactions = await Transaction.find({ owner: ownerId });
        
        if (transactions.length === 0) {
            return [];
        }
        return transactions.map(item => {
            const sanitizedItem = item.sanitize();

            const owner: IOwner = {
                email
            };
    
            if (name) {
                owner.name = name;
            }

            return {
                ...sanitizedItem,
                owner
            };
        });
    }

    static async delete(ownerId: ObjectId, transactionId: string): Promise<ITransactionDetails> {

        const existingTransaction = await Transaction.find({ owner: ownerId, _id: transactionId });

        if (existingTransaction.length === 0) {
            throw new AppError(httpStatus.NOT_FOUND, errorMessages.TRANSACTIONS.TRANSACTION_NOT_FOUND);
        }

        const removingItem = await Transaction.findByIdAndRemove(transactionId);

        if (!removingItem) {
            throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, errorMessages.GENERAL.DATABASE_PROCESS_WAS_FAILED);
        }
        return removingItem.sanitize();
    }

    static async add(ownerId: ObjectId, data: ITransaction): Promise<ITransactionDetails> {

        const currentUser = await User.findById(ownerId);

        if (!currentUser) {
            throw new AppError(404, errorMessages.AUTH.USER_IS_NOT_FOUND);
        }
        
        const createdTransaction = await Transaction.create({
            owner: ownerId,
            ...data
        });
            
        const transactionData = createdTransaction.sanitize();

        const owner: IOwner = {
            email: currentUser.email
        };

        if (currentUser.name) {
            owner.name = currentUser.name;
        }

        return {
            ...transactionData,
            owner
        };
    }

    static async _filter(ownerId: ObjectId, filterParams: Required<IFilterParams>): Promise<IFilterQueryResult | null> {
        const { month, year } = filterParams;

        const noIncomeSumObj = { _id: 'incomeSum', total: 0 };

        if (month === 'all' && year === 'all') {

            const expense = await Transaction.aggregate([
                { $match: { owner: ownerId, type: 'expense' } },
                { $project: { _id: false, category: true, sum: true } },
                { $group: { _id: '$category', total: { $sum: '$sum' } } }
            ]);
            const [income] = await Transaction.aggregate([
                { $match: { owner: ownerId, type: 'income' } },
                { $project: { _id: false, category: true, date: true, sum: true } },
                { $group: { _id: 'incomeSum', total: { $sum: '$sum' } } }
            ]);

            const result: IFilterQueryResult = {
                expense,
                income: income || noIncomeSumObj
            };
            return result;
        }
        if (month !== 'all' && year === 'all') {

            const expense = await Transaction.aggregate([
                { $match: { owner: ownerId, type: 'expense', 'date.month': +month } },
                { $project: { _id: false, category: true, sum: true } },
                { $group: { _id: '$category', total: { $sum: '$sum' } } }
            ]);
            const [income] = await Transaction.aggregate([
                { $match: { owner: ownerId, type: 'income', 'date.month': +month } },
                { $project: { _id: false, category: true, sum: true } },
                { $group: { _id: 'incomeSum', total: { $sum: '$sum' } } }
            ]);

            const result: IFilterQueryResult = {
                expense,
                income: income || noIncomeSumObj
            };
            return result;
        }
        if (month === 'all' && year !== 'all') {

            const expense = await Transaction.aggregate([
                { $match: { owner: ownerId, type: 'expense', 'date.year': +year } },
                { $project: { _id: false, category: true, sum: true } },
                { $group: { _id: '$category', total: { $sum: '$sum' } } }
            ]);
            const [income] = await Transaction.aggregate([
                { $match: { owner: ownerId, type: 'income', 'date.year': +year } },
                { $project: { _id: false, category: true, sum: true } },
                { $group: { _id: 'incomeSum', total: { $sum: '$sum' } } }
            ]);

            const result: IFilterQueryResult = {
                expense,
                income: income || noIncomeSumObj
            };
            return result;
        }
        if (month !== 'all' && year !== 'all') {

            const expense = await Transaction.aggregate([
                { $match: { owner: ownerId, type: 'expense', 'date.month': +month, 'date.year': +year } },
                { $project: { _id: false, category: true, sum: true } },
                { $group: { _id: '$category', total: { $sum: '$sum' } } }
            ]);
            const [income] = await Transaction.aggregate([
                { $match: { owner: ownerId, type: 'income', 'date.month': +month, 'date.year': +year } },
                { $project: { _id: false, category: true, sum: true } },
                { $group: { _id: 'incomeSum', total: { $sum: '$sum' } } }
            ]);

            const result: IFilterQueryResult = {
                expense,
                income: income || noIncomeSumObj
            };
            return result;
        }
        else {
            return null;
        }
    }

    static async getStatisticCategory (ownerId: ObjectId, filterParams: Required<IFilterParams>): Promise<IStatisticCategories> {
        const queryResult = await TransactionsService._filter(ownerId, filterParams);

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
                return {
                    ...omit(item, '_id'), 
                    categoryType: item._id
                };
            }),
            income: {
                ...omit(queryResult.income, '_id')
            }
        };

        return result;
    }
}