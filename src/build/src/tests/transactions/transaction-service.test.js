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
const transaction_service_1 = require("../../services/transaction.service");
const user_1 = require("../../models/user");
const lodash_1 = require("lodash");
const transactions_fixtures_1 = require("../fixtures/transactions.fixtures");
const transaction_1 = require("../../models/transaction");
const setDatabaseConnection_1 = require("../utils/setDatabaseConnection");
const setMockSettings_1 = require("../utils/setMockSettings");
const auth_service_fixtures_1 = require("../fixtures/auth-service.fixtures");
const errors_1 = require("../../errors");
const bson_1 = require("bson");
const node_util_1 = __importDefault(require("node:util"));
(0, setDatabaseConnection_1.setDatabaseConnection)();
(0, setMockSettings_1.setMockSettings)();
describe('Transaction-Service tests method add', () => {
    it('Should create new transaction, and return created result with user name and user email', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, auth_service_fixtures_1.setExistingUser)();
        expect.assertions(3);
        const findUser = jest.spyOn(user_1.User, 'findById');
        const createTransaction = jest.spyOn(transaction_1.Transaction, 'create');
        const result = yield transaction_service_1.TransactionsService.add(auth_service_fixtures_1.existingUserObjectId, transactions_fixtures_1.defaultExpenceTransaction);
        expect(findUser).toBeCalledWith(auth_service_fixtures_1.existingUserObjectId);
        expect(createTransaction).toBeCalledWith(Object.assign({ owner: auth_service_fixtures_1.existingUserObjectId }, transactions_fixtures_1.defaultExpenceTransaction));
        expect(result).toEqual(expect.objectContaining(Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction), { owner: {
                name: auth_service_fixtures_1.existingUser.name,
                email: auth_service_fixtures_1.existingUser.email
            } })));
    }));
    it('Should create new transaction, and return created result with user email only (user name is not exist)', () => __awaiter(void 0, void 0, void 0, function* () {
        const existingUserWithoutName = (0, lodash_1.omit)(auth_service_fixtures_1.existingUser, 'name');
        yield (0, auth_service_fixtures_1.setUsersInDB)([existingUserWithoutName]);
        expect.assertions(3);
        const findUser = jest.spyOn(user_1.User, 'findById');
        const createTransaction = jest.spyOn(transaction_1.Transaction, 'create');
        const result = yield transaction_service_1.TransactionsService.add(auth_service_fixtures_1.existingUserObjectId, transactions_fixtures_1.defaultExpenceTransaction);
        expect(findUser).toBeCalledWith(auth_service_fixtures_1.existingUserObjectId);
        expect(createTransaction).toBeCalledWith(Object.assign({ owner: auth_service_fixtures_1.existingUserObjectId }, transactions_fixtures_1.defaultExpenceTransaction));
        expect(result).toEqual(expect.objectContaining({
            owner: expect.not.objectContaining({
                name: auth_service_fixtures_1.existingUser.name
            })
        }));
    }));
    it('Should throw error 404, user in not found', () => __awaiter(void 0, void 0, void 0, function* () {
        expect.assertions(3);
        const invalidData = {
            id: auth_service_fixtures_1.fakeData.unexisting.objectId
        };
        const findUser = jest.spyOn(user_1.User, 'findById');
        const createTransaction = jest.spyOn(transaction_1.Transaction, 'create');
        yield expect(transaction_service_1.TransactionsService.add(invalidData.id, transactions_fixtures_1.defaultExpenceTransaction))
            .rejects.toMatchObject({
            code: 404,
            message: errors_1.errorMessages.AUTH.USER_IS_NOT_FOUND
        });
        expect(findUser).toBeCalledWith(invalidData.id);
        expect(createTransaction).not.toBeCalled();
    }));
});
describe('Transaction-Service tests method delete', () => {
    it('Should remove transaction, and return removed item data', () => __awaiter(void 0, void 0, void 0, function* () {
        yield Promise.all([
            (0, transactions_fixtures_1.setDefaultTransactions)(),
            (0, auth_service_fixtures_1.setExistingUser)()
        ]);
        const deletedTransactionId = transactions_fixtures_1.defaultExpenceTransactionId.toHexString();
        expect.assertions(3);
        const findTransaction = jest.spyOn(transaction_1.Transaction, 'find');
        const removeTransaction = jest.spyOn(transaction_1.Transaction, 'findByIdAndRemove');
        const result = yield transaction_service_1.TransactionsService.delete(auth_service_fixtures_1.existingUserObjectId, deletedTransactionId);
        expect(findTransaction).toBeCalledWith({
            owner: auth_service_fixtures_1.existingUserObjectId,
            _id: deletedTransactionId
        });
        expect(removeTransaction).toBeCalledWith(deletedTransactionId);
        expect(result).toEqual(expect.objectContaining(Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction), { id: deletedTransactionId })));
    }));
    it('Should throw error, transaction not found', () => __awaiter(void 0, void 0, void 0, function* () {
        const deletedTransactionId = transactions_fixtures_1.defaultExpenceTransactionId.toHexString();
        yield (0, auth_service_fixtures_1.setExistingUser)();
        expect.assertions(2);
        const findTransaction = jest.spyOn(transaction_1.Transaction, 'find');
        yield expect(transaction_service_1.TransactionsService.delete(auth_service_fixtures_1.existingUserObjectId, deletedTransactionId)).rejects.toMatchObject({
            code: 404,
            message: node_util_1.default.format(errors_1.errorMessages.TRANSACTIONS.TRANSACTION_NOT_FOUND, deletedTransactionId)
        });
        expect(findTransaction).toBeCalledWith({
            owner: auth_service_fixtures_1.existingUserObjectId,
            _id: deletedTransactionId
        });
    }));
    it('Should throw error, deleting process failed', () => __awaiter(void 0, void 0, void 0, function* () {
        const deletedTransactionId = transactions_fixtures_1.defaultExpenceTransactionId.toHexString();
        yield Promise.all([
            (0, transactions_fixtures_1.setDefaultTransactions)(),
            (0, auth_service_fixtures_1.setExistingUser)()
        ]);
        expect.assertions(3);
        const findTransaction = jest.spyOn(transaction_1.Transaction, 'find');
        const findByIdAndemove = jest.spyOn(transaction_1.Transaction, 'findByIdAndRemove').mockResolvedValue(null);
        yield expect(transaction_service_1.TransactionsService.delete(auth_service_fixtures_1.existingUserObjectId, deletedTransactionId)).rejects.toMatchObject({
            code: 500,
            message: errors_1.errorMessages.GENERAL.DATABASE_PROCESS_WAS_FAILED
        });
        expect(findTransaction).toBeCalledWith({
            owner: auth_service_fixtures_1.existingUserObjectId,
            _id: deletedTransactionId
        });
        expect(findByIdAndemove).toBeCalledWith(deletedTransactionId);
    }));
});
describe('Transaction-Service tests method findByOwner', () => {
    it('Should return array with one transactions object', () => __awaiter(void 0, void 0, void 0, function* () {
        yield Promise.all([
            (0, transactions_fixtures_1.setTransactionsInDB)([
                Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction), { id: transactions_fixtures_1.defaultExpenceTransactionId, owner: auth_service_fixtures_1.existingUserObjectId }),
                Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction), { id: new bson_1.ObjectId(), owner: new bson_1.ObjectId() }),
                Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction), { id: new bson_1.ObjectId(), owner: new bson_1.ObjectId() })
            ]),
            (0, auth_service_fixtures_1.setExistingUser)()
        ]);
        expect.assertions(2);
        const findTransaction = jest.spyOn(transaction_1.Transaction, 'find');
        const result = yield transaction_service_1.TransactionsService.findByOwner({
            name: auth_service_fixtures_1.existingUser.name,
            email: auth_service_fixtures_1.existingUser.email,
            id: auth_service_fixtures_1.existingUserObjectId
        });
        expect(findTransaction).toBeCalledWith({
            owner: auth_service_fixtures_1.existingUserObjectId
        });
        expect(result).toEqual(expect.arrayContaining([
            expect.objectContaining(Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction), { owner: {
                    email: auth_service_fixtures_1.existingUser.email,
                    name: auth_service_fixtures_1.existingUser.name
                }, id: transactions_fixtures_1.defaultExpenceTransactionId.toHexString() }))
        ]));
    }));
    it('Should return empty array, there is no transactions in database', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, auth_service_fixtures_1.setExistingUser)();
        expect.assertions(3);
        const findTransaction = jest.spyOn(transaction_1.Transaction, 'find');
        const result = yield transaction_service_1.TransactionsService.findByOwner({
            name: auth_service_fixtures_1.existingUser.name,
            email: auth_service_fixtures_1.existingUser.email,
            id: auth_service_fixtures_1.existingUserObjectId
        });
        expect(findTransaction).toBeCalledWith({
            owner: auth_service_fixtures_1.existingUserObjectId
        });
        expect(Array.isArray(result)).toBeTruthy();
        expect(result.length).toBe(0);
    }));
});
describe('Transaction-Service tests method filter', () => {
    it('Should return all transactions, flter params are default', () => __awaiter(void 0, void 0, void 0, function* () {
        const filterParams = {
            month: 'all',
            year: 'all'
        };
        yield Promise.all([
            (0, transactions_fixtures_1.setDefaultTransactions)(),
            (0, auth_service_fixtures_1.setExistingUser)()
        ]);
        expect.assertions(2);
        const _filter = jest.spyOn(transaction_service_1.TransactionsService, '_filter');
        const result = yield transaction_service_1.TransactionsService.getStatisticCategory(auth_service_fixtures_1.existingUserObjectId, filterParams);
        expect(_filter).toBeCalledWith(auth_service_fixtures_1.existingUserObjectId, filterParams);
        expect(result).toEqual({
            expense: expect.arrayContaining([
                expect.objectContaining({
                    categoryType: transactions_fixtures_1.defaultExpenceTransaction.category,
                    total: transactions_fixtures_1.defaultExpenceTransaction.sum
                })
            ]),
            income: {
                total: transactions_fixtures_1.defaultIncomeTransaction.sum
            }
        });
    }));
    it('Should return all transactions, flter params are default', () => __awaiter(void 0, void 0, void 0, function* () {
        const filterParams = {
            month: 'all',
            year: 'all'
        };
        yield Promise.all([
            (0, transactions_fixtures_1.setDefaultTransactions)(),
            (0, auth_service_fixtures_1.setExistingUser)()
        ]);
        expect.assertions(2);
        const _filter = jest.spyOn(transaction_service_1.TransactionsService, '_filter');
        const result = yield transaction_service_1.TransactionsService.getStatisticCategory(auth_service_fixtures_1.existingUserObjectId, filterParams);
        expect(_filter).toBeCalledWith(auth_service_fixtures_1.existingUserObjectId, filterParams);
        expect(result).toEqual({
            expense: expect.arrayContaining([
                expect.objectContaining({
                    categoryType: transactions_fixtures_1.defaultExpenceTransaction.category,
                    total: transactions_fixtures_1.defaultExpenceTransaction.sum
                })
            ]),
            income: {
                total: transactions_fixtures_1.defaultIncomeTransaction.sum
            }
        });
    }));
    it('Should return only at 9 month created transactions, filter parametr month(9)', () => __awaiter(void 0, void 0, void 0, function* () {
        const filterParams = {
            month: 9,
            year: 'all'
        };
        yield Promise.all([
            (0, transactions_fixtures_1.setDefaultTransactions)(),
            (0, auth_service_fixtures_1.setExistingUser)()
        ]);
        expect.assertions(2);
        const _filter = jest.spyOn(transaction_service_1.TransactionsService, '_filter');
        const result = yield transaction_service_1.TransactionsService.getStatisticCategory(auth_service_fixtures_1.existingUserObjectId, filterParams);
        expect(_filter).toBeCalledWith(auth_service_fixtures_1.existingUserObjectId, filterParams);
        expect(result).toEqual({
            expense: expect.arrayContaining([
                expect.objectContaining({
                    categoryType: transactions_fixtures_1.defaultExpenceTransaction.category,
                    total: transactions_fixtures_1.defaultExpenceTransaction.sum
                })
            ]),
            income: {
                total: 0
            }
        });
    }));
    it('Should not return any transactions, there is no transactions in filter period', () => __awaiter(void 0, void 0, void 0, function* () {
        const filterParams = {
            month: 4,
            year: 'all'
        };
        yield Promise.all([
            (0, transactions_fixtures_1.setDefaultTransactions)(),
            (0, auth_service_fixtures_1.setExistingUser)()
        ]);
        expect.assertions(4);
        const _filter = jest.spyOn(transaction_service_1.TransactionsService, '_filter');
        const result = yield transaction_service_1.TransactionsService.getStatisticCategory(auth_service_fixtures_1.existingUserObjectId, filterParams);
        expect(_filter).toBeCalledWith(auth_service_fixtures_1.existingUserObjectId, filterParams);
        expect(result).toEqual({
            expense: [],
            income: {
                total: 0
            }
        });
        expect(result.expense.length).toBe(0);
        expect(result.income.total).toBe(0);
    }));
    it('Should return only at 2022 year created transactions, filter parametr year(2022)', () => __awaiter(void 0, void 0, void 0, function* () {
        const filterParams = {
            month: 'all',
            year: 2022
        };
        yield Promise.all([
            (0, transactions_fixtures_1.setDefaultTransactions)(),
            (0, auth_service_fixtures_1.setExistingUser)()
        ]);
        expect.assertions(2);
        const _filter = jest.spyOn(transaction_service_1.TransactionsService, '_filter');
        const result = yield transaction_service_1.TransactionsService.getStatisticCategory(auth_service_fixtures_1.existingUserObjectId, filterParams);
        expect(_filter).toBeCalledWith(auth_service_fixtures_1.existingUserObjectId, filterParams);
        expect(result).toEqual({
            expense: expect.arrayContaining([
                expect.objectContaining({
                    categoryType: transactions_fixtures_1.defaultExpenceTransaction.category,
                    total: transactions_fixtures_1.defaultExpenceTransaction.sum
                })
            ]),
            income: {
                total: 0
            }
        });
    }));
    it('Should not return any transactions, there is no transactions in filter period(year 2020)', () => __awaiter(void 0, void 0, void 0, function* () {
        const filterParams = {
            month: 'all',
            year: 2020
        };
        yield Promise.all([
            (0, transactions_fixtures_1.setDefaultTransactions)(),
            (0, auth_service_fixtures_1.setExistingUser)()
        ]);
        expect.assertions(4);
        const _filter = jest.spyOn(transaction_service_1.TransactionsService, '_filter');
        const result = yield transaction_service_1.TransactionsService.getStatisticCategory(auth_service_fixtures_1.existingUserObjectId, filterParams);
        expect(_filter).toBeCalledWith(auth_service_fixtures_1.existingUserObjectId, filterParams);
        expect(result).toEqual({
            expense: [],
            income: {
                total: 0
            }
        });
        expect(result.expense.length).toBe(0);
        expect(result.income.total).toBe(0);
    }));
    it('Should return only at 9 month and 2022 year created transactions, filter params(month: 9, year: 2022)', () => __awaiter(void 0, void 0, void 0, function* () {
        const filterParams = {
            month: 9,
            year: 2022
        };
        yield Promise.all([
            (0, transactions_fixtures_1.setDefaultTransactions)(),
            (0, auth_service_fixtures_1.setExistingUser)()
        ]);
        expect.assertions(2);
        const _filter = jest.spyOn(transaction_service_1.TransactionsService, '_filter');
        const result = yield transaction_service_1.TransactionsService.getStatisticCategory(auth_service_fixtures_1.existingUserObjectId, filterParams);
        expect(_filter).toBeCalledWith(auth_service_fixtures_1.existingUserObjectId, filterParams);
        expect(result).toEqual({
            expense: expect.arrayContaining([
                expect.objectContaining({
                    categoryType: transactions_fixtures_1.defaultExpenceTransaction.category,
                    total: transactions_fixtures_1.defaultExpenceTransaction.sum
                })
            ]),
            income: {
                total: 0
            }
        });
    }));
    it('Should not return any transactions, there is no transactions in filter period(month: 9, year: 2020)', () => __awaiter(void 0, void 0, void 0, function* () {
        const filterParams = {
            month: 9,
            year: 2020
        };
        yield Promise.all([
            (0, transactions_fixtures_1.setDefaultTransactions)(),
            (0, auth_service_fixtures_1.setExistingUser)()
        ]);
        expect.assertions(4);
        const _filter = jest.spyOn(transaction_service_1.TransactionsService, '_filter');
        const result = yield transaction_service_1.TransactionsService.getStatisticCategory(auth_service_fixtures_1.existingUserObjectId, filterParams);
        expect(_filter).toBeCalledWith(auth_service_fixtures_1.existingUserObjectId, filterParams);
        expect(result).toEqual({
            expense: [],
            income: {
                total: 0
            }
        });
        expect(result.expense.length).toBe(0);
        expect(result.income.total).toBe(0);
    }));
});
