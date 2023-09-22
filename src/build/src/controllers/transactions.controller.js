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
exports.TransactionController = void 0;
const transaction_service_1 = require("../services/transaction.service");
const http_status_1 = __importDefault(require("http-status"));
class TransactionController {
    static _addTransactions(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id: owner } = req.user;
            const transaction = yield transaction_service_1.TransactionsService.add(owner, req.body);
            res.status(201).json(transaction);
        });
    }
    static addTransactions(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            return TransactionController._addTransactions(req, res, next);
        });
    }
    static deleteTransaction(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id: transactionId } = req.params;
            const { id: ownerId } = req.user;
            yield transaction_service_1.TransactionsService.delete(ownerId, transactionId);
            res.status(http_status_1.default.NO_CONTENT).send();
        });
    }
    static getAllTransactions(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const transactions = yield transaction_service_1.TransactionsService.findByOwner(req.user);
            res.status(http_status_1.default.OK).json(transactions);
        });
    }
    static getStatisticsCategories(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id: ownerId } = req.user;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const month = req.query.month;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const year = req.query.year;
            const result = yield transaction_service_1.TransactionsService.getStatisticCategory(ownerId, { month, year });
            res.status(http_status_1.default.OK).json(result);
        });
    }
}
exports.TransactionController = TransactionController;
