import { TransactionsService } from '../../services/transaction.service';
import { User } from '../../models/user';
import { omit } from 'lodash';
import { defaultIncomeTransaction, defaultExpenceTransaction, setTransactionsInDB, setDefaultTransactions, defaultExpenceTransactionId } from '../fixtures/transactions.fixtures';
import { Transaction } from '../../models/transaction';
import { setDatabaseConnection } from '../utils/setDatabaseConnection';
import { setMockSettings } from '../utils/setMockSettings';
import { setUsersInDB, existingUser, setExistingUser, existingUserObjectId, fakeData } from '../fixtures/auth-service.fixtures';
import { errorMessages } from '../../errors';
import { ObjectId } from 'bson';
import util from 'node:util';

setDatabaseConnection();
setMockSettings();

describe('Transaction-Service tests method add', () => {
    it('Should create new transaction, and return created result with user name and user email', async () => {
        await setExistingUser();

        expect.assertions(3);

        const findUser = jest.spyOn(User, 'findById');
        const createTransaction = jest.spyOn(Transaction, 'create');

        const result = await TransactionsService.add(existingUserObjectId, defaultExpenceTransaction);

        expect(findUser).toBeCalledWith(existingUserObjectId);
        expect(createTransaction).toBeCalledWith({
            owner: existingUserObjectId,
            ...defaultExpenceTransaction
        });
        expect(result).toEqual(expect.objectContaining({
            ...defaultExpenceTransaction,
            owner: {
                name: existingUser.name,
                email: existingUser.email
            }
        }));
    });

    it('Should create new transaction, and return created result with user email only (user name is not exist)', async () => {
        const existingUserWithoutName = omit(existingUser, 'name');

        await setUsersInDB([existingUserWithoutName]);

        expect.assertions(3);

        const findUser = jest.spyOn(User, 'findById');
        const createTransaction = jest.spyOn(Transaction, 'create');

        const result = await TransactionsService.add(existingUserObjectId, defaultExpenceTransaction);

        expect(findUser).toBeCalledWith(existingUserObjectId);
        expect(createTransaction).toBeCalledWith({
            owner: existingUserObjectId, 
            ...defaultExpenceTransaction
        });
        expect(result).toEqual(expect.objectContaining({
            owner: expect.not.objectContaining({
                name: existingUser.name
            })
        }));
    });

    it('Should throw error 404, user in not found', async () => {
        expect.assertions(3);

        const invalidData = {
            id: fakeData.unexisting.objectId
        };

        const findUser = jest.spyOn(User, 'findById');
        const createTransaction = jest.spyOn(Transaction, 'create');

        await expect(TransactionsService.add(invalidData.id, defaultExpenceTransaction))
            .rejects.toMatchObject({
                code: 404,
                message: errorMessages.AUTH.USER_IS_NOT_FOUND
            });

        expect(findUser).toBeCalledWith(invalidData.id);
        expect(createTransaction).not.toBeCalled();

    });
});

describe('Transaction-Service tests method delete', () => {

    it('Should remove transaction, and return removed item data', async () => {

        await Promise.all([
            setDefaultTransactions(),
            setExistingUser()
        ]);

        const deletedTransactionId = defaultExpenceTransactionId.toHexString();

        expect.assertions(3);

        const findTransaction = jest.spyOn(Transaction, 'find');
        const removeTransaction = jest.spyOn( Transaction, 'findByIdAndRemove');

        const result = await TransactionsService.delete(
            existingUserObjectId, 
            deletedTransactionId
        );

        expect(findTransaction).toBeCalledWith({
            owner: existingUserObjectId,
            _id: deletedTransactionId
        });
        expect(removeTransaction).toBeCalledWith(deletedTransactionId);
        expect(result).toEqual(expect.objectContaining({
            ...defaultExpenceTransaction,
            id: deletedTransactionId
        }));
    });

    it('Should throw error, transaction not found', async () => {

        const deletedTransactionId = defaultExpenceTransactionId.toHexString();

        await setExistingUser();

        expect.assertions(2);

        const findTransaction = jest.spyOn(Transaction, 'find');

        await expect(TransactionsService.delete(existingUserObjectId, deletedTransactionId)).rejects.toMatchObject({
            code: 404,
            message: util.format(errorMessages.TRANSACTIONS.TRANSACTION_NOT_FOUND, deletedTransactionId)
        });

        expect(findTransaction).toBeCalledWith({
            owner: existingUserObjectId,
            _id: deletedTransactionId
        });
    });

    it('Should throw error, deleting process failed', async () => {
        const deletedTransactionId = defaultExpenceTransactionId.toHexString();

        await Promise.all([
            setDefaultTransactions(),
            setExistingUser()
        ]);

        expect.assertions(3);

        const findTransaction = jest.spyOn(Transaction, 'find');
        const findByIdAndemove = jest.spyOn(Transaction, 'findByIdAndRemove').mockResolvedValue(null);

        await expect(TransactionsService.delete(existingUserObjectId, deletedTransactionId)).rejects.toMatchObject({
            code: 500,
            message: errorMessages.GENERAL.DATABASE_PROCESS_WAS_FAILED
        });

        expect(findTransaction).toBeCalledWith({
            owner: existingUserObjectId,
            _id: deletedTransactionId
        });
        expect(findByIdAndemove).toBeCalledWith(deletedTransactionId);
    });
});

describe('Transaction-Service tests method findByOwner', () => {
    it('Should return array with one transactions object', async () => {

        await Promise.all([
            setTransactionsInDB(
                [
                    {
                        ...defaultExpenceTransaction,
                        id: defaultExpenceTransactionId,
                        owner: existingUserObjectId
                    },
                    {
                        ...defaultExpenceTransaction,
                        id: new ObjectId(),
                        owner: new ObjectId()
                    },
                    {
                        ...defaultExpenceTransaction,
                        id: new ObjectId(),
                        owner: new ObjectId()
                    }
                ]
            ),
            setExistingUser()
        ]);

        expect.assertions(2);

        const findTransaction = jest.spyOn(Transaction, 'find');

        const result = await TransactionsService.findByOwner({
            name: existingUser.name,
            email: existingUser.email,
            id: existingUserObjectId
        });

        expect(findTransaction).toBeCalledWith({
            owner: existingUserObjectId
        });
        expect(result).toEqual(expect.arrayContaining([
            expect.objectContaining({
                ...defaultExpenceTransaction,
                owner: {
                    email: existingUser.email,
                    name: existingUser.name
                },
                id: defaultExpenceTransactionId.toHexString()
            })
        ]));
    });

    it('Should return empty array, there is no transactions in database', async () => {
        setExistingUser();

        expect.assertions(3);

        const findTransaction = jest.spyOn(Transaction, 'find');

        const result = await TransactionsService.findByOwner({
            name: existingUser.name,
            email: existingUser.email,
            id: existingUserObjectId
        });

        expect(findTransaction).toBeCalledWith({
            owner: existingUserObjectId
        });
        expect(Array.isArray(result)).toBeTruthy();
        expect(result.length).toBe(0);
    });
});

describe('Transaction-Service tests method filter', () => {
    it('Should return all transactions, flter params are default', async () => {

        const filterParams = {
            month: 'all',
            year: 'all'
        };

        await Promise.all([
            setDefaultTransactions(),
            setExistingUser()
        ]);

        expect.assertions(2);

        const _filter = jest.spyOn(TransactionsService, '_filter');
        const result = await TransactionsService.getStatisticCategory(existingUserObjectId, filterParams);

        expect(_filter).toBeCalledWith(existingUserObjectId, filterParams);
        expect(result).toEqual({
            expense: expect.arrayContaining([
                expect.objectContaining({
                    categoryType: defaultExpenceTransaction.category,
                    total: defaultExpenceTransaction.sum
                })
            ]),

            income: {
                total: defaultIncomeTransaction.sum
            }
        });
    });

    it('Should return all transactions, flter params are default', async () => {

        const filterParams = {
            month: 'all',
            year: 'all'
        };

        await Promise.all([
            setDefaultTransactions(),
            setExistingUser()
        ]);

        expect.assertions(2);

        const _filter = jest.spyOn(TransactionsService, '_filter');
        const result = await TransactionsService.getStatisticCategory(existingUserObjectId, filterParams);

        expect(_filter).toBeCalledWith(existingUserObjectId, filterParams);
        expect(result).toEqual({
            expense: expect.arrayContaining([
                expect.objectContaining({
                    categoryType: defaultExpenceTransaction.category,
                    total: defaultExpenceTransaction.sum
                })
            ]),

            income: {
                total: defaultIncomeTransaction.sum
            }
        });
    });

    it('Should return only at 9 month created transactions, filter parametr month(9)', async () => {

        const filterParams = {
            month: 9,
            year: 'all'
        };

        await Promise.all([
            setDefaultTransactions(),
            setExistingUser()
        ]);

        expect.assertions(2);

        const _filter = jest.spyOn(TransactionsService, '_filter');
        const result = await TransactionsService.getStatisticCategory(existingUserObjectId, filterParams);

        expect(_filter).toBeCalledWith(existingUserObjectId, filterParams);
        expect(result).toEqual({
            expense: expect.arrayContaining([
                expect.objectContaining({
                    categoryType: defaultExpenceTransaction.category,
                    total: defaultExpenceTransaction.sum
                })
            ]),

            income: {
                total: 0
            }
        });
    });

    it('Should not return any transactions, there is no transactions in filter period', async () => {

        const filterParams = {
            month: 4,
            year: 'all'
        };

        await Promise.all([
            setDefaultTransactions(),
            setExistingUser()
        ]);

        expect.assertions(4);

        const _filter = jest.spyOn(TransactionsService, '_filter');
        const result = await TransactionsService.getStatisticCategory(existingUserObjectId, filterParams);

        expect(_filter).toBeCalledWith(existingUserObjectId, filterParams);
        expect(result).toEqual({
            expense: [

            ],

            income: {
                total: 0
            }
        });
        expect(result.expense.length).toBe(0);
        expect(result.income.total).toBe(0);
    });

    it('Should return only at 2022 year created transactions, filter parametr year(2022)', async () => {

        const filterParams = {
            month: 'all',
            year: 2022
        };

        await Promise.all([
            setDefaultTransactions(),
            setExistingUser()
        ]);

        expect.assertions(2);

        const _filter = jest.spyOn(TransactionsService, '_filter');
        const result = await TransactionsService.getStatisticCategory(existingUserObjectId, filterParams);

        expect(_filter).toBeCalledWith(existingUserObjectId, filterParams);
        expect(result).toEqual({
            expense: expect.arrayContaining([
                expect.objectContaining({
                    categoryType: defaultExpenceTransaction.category,
                    total: defaultExpenceTransaction.sum
                })
            ]),

            income: {
                total: 0
            }
        });
    });

    it('Should not return any transactions, there is no transactions in filter period(year 2020)', async () => {

        const filterParams = {
            month: 'all',
            year: 2020
        };

        await Promise.all([
            setDefaultTransactions(),
            setExistingUser()
        ]);

        expect.assertions(4);

        const _filter = jest.spyOn(TransactionsService, '_filter');
        const result = await TransactionsService.getStatisticCategory(existingUserObjectId, filterParams);

        expect(_filter).toBeCalledWith(existingUserObjectId, filterParams);
        expect(result).toEqual({
            expense: [

            ],

            income: {
                total: 0
            }
        });
        expect(result.expense.length).toBe(0);
        expect(result.income.total).toBe(0);
    });

    it('Should return only at 9 month and 2022 year created transactions, filter params(month: 9, year: 2022)', async () => {

        const filterParams = {
            month: 9,
            year: 2022
        };

        await Promise.all([
            setDefaultTransactions(),
            setExistingUser()
        ]);

        expect.assertions(2);

        const _filter = jest.spyOn(TransactionsService, '_filter');
        const result = await TransactionsService.getStatisticCategory(existingUserObjectId, filterParams);

        expect(_filter).toBeCalledWith(existingUserObjectId, filterParams);
        expect(result).toEqual({
            expense: expect.arrayContaining([
                expect.objectContaining({
                    categoryType: defaultExpenceTransaction.category,
                    total: defaultExpenceTransaction.sum
                })
            ]),

            income: {
                total: 0
            }
        });
    });

    it('Should not return any transactions, there is no transactions in filter period(month: 9, year: 2020)', async () => {

        const filterParams = {
            month: 9,
            year: 2020
        };

        await Promise.all([
            setDefaultTransactions(),
            setExistingUser()
        ]);

        expect.assertions(4);

        const _filter = jest.spyOn(TransactionsService, '_filter');
        const result = await TransactionsService.getStatisticCategory(existingUserObjectId, filterParams);

        expect(_filter).toBeCalledWith(existingUserObjectId, filterParams);
        expect(result).toEqual({
            expense: [

            ],

            income: {
                total: 0
            }
        });
        expect(result.expense.length).toBe(0);
        expect(result.income.total).toBe(0);
    });
});
