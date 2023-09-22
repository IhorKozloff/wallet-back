import { omit } from 'lodash';
import { Transaction } from '../../models/transaction';
import { ITransaction, ITransactionDetails } from '../../types/entities/transaction';
import { ObjectId } from 'bson';
import { existingUserObjectId } from './auth-service.fixtures';

export const defaultExpenceTransactionId = new ObjectId();
export const defaultExpenceTransaction: ITransaction = {
    date: {
        day: 6,
        month: 9,
        year: 2022,
    },
    type: 'expense',
    category: 'food',
    comment: 'bread, bottle, bear',
    sum: 400,
};

export const defaultIncomeTransactionId = new ObjectId();
export const defaultIncomeTransaction : ITransaction = {
    date: {
        day: 1,
        month: 3,
        year: 2023,
    },
    type: 'income',
    category: 'salary',
    comment: 'washing',
    sum: 100,
}

export const setTransactionsInDB = async (transactions: Array<Omit<ITransactionDetails, 'owner'> & {owner: ObjectId}>) => {
    const preparedData = transactions.map(item => {
        return {
            ...omit(item, ['id']),
            _id: item.id,
            date: {
                ...item.date,
                _id: new ObjectId()
            }
        };
    });

    return Transaction.insertMany(preparedData);
};

export const setDefaultTransactions = async () => {
    await setTransactionsInDB(
        [
            {
                ...defaultExpenceTransaction,
                id: defaultExpenceTransactionId,
                owner: existingUserObjectId
            },
            {
                ...defaultIncomeTransaction,
                id: defaultIncomeTransactionId,
                owner: existingUserObjectId
            }
        ]
    )
}
