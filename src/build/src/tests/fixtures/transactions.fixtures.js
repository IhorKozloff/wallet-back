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
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDefaultTransactions = exports.setTransactionsInDB = exports.defaultIncomeTransaction = exports.defaultIncomeTransactionId = exports.defaultExpenceTransaction = exports.defaultExpenceTransactionId = void 0;
const lodash_1 = require("lodash");
const transaction_1 = require("../../models/transaction");
const bson_1 = require("bson");
const auth_service_fixtures_1 = require("./auth-service.fixtures");
exports.defaultExpenceTransactionId = new bson_1.ObjectId();
exports.defaultExpenceTransaction = {
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
exports.defaultIncomeTransactionId = new bson_1.ObjectId();
exports.defaultIncomeTransaction = {
    date: {
        day: 1,
        month: 3,
        year: 2023,
    },
    type: 'income',
    category: 'salary',
    comment: 'washing',
    sum: 100,
};
const setTransactionsInDB = (transactions) => __awaiter(void 0, void 0, void 0, function* () {
    const preparedData = transactions.map(item => {
        return Object.assign(Object.assign({}, (0, lodash_1.omit)(item, ['id'])), { _id: item.id, date: Object.assign(Object.assign({}, item.date), { _id: new bson_1.ObjectId() }) });
    });
    return transaction_1.Transaction.insertMany(preparedData);
});
exports.setTransactionsInDB = setTransactionsInDB;
const setDefaultTransactions = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, exports.setTransactionsInDB)([
        Object.assign(Object.assign({}, exports.defaultExpenceTransaction), { id: exports.defaultExpenceTransactionId, owner: auth_service_fixtures_1.existingUserObjectId }),
        Object.assign(Object.assign({}, exports.defaultIncomeTransaction), { id: exports.defaultIncomeTransactionId, owner: auth_service_fixtures_1.existingUserObjectId })
    ]);
});
exports.setDefaultTransactions = setDefaultTransactions;
