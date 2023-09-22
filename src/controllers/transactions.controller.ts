import { TransactionsService } from '../services/transaction.service';
import { NextFunction, Request, Response } from 'express';
import { IAddTransactionUserRequest, IDeleteTransactionUserRequest, IStatisticUserRequest } from '../types/entities/transaction';
import httpStatus from 'http-status';

export class TransactionController {

    static async _addTransactions(req: IAddTransactionUserRequest, res: Response, next: NextFunction) {

        const { id: owner } = req.user;

        const transaction = await TransactionsService.add(owner, req.body);

        res.status(201).json(transaction);
    }

    static async addTransactions(req: IAddTransactionUserRequest, res: Response, next: NextFunction) {
        return TransactionController._addTransactions(req, res, next);
    }

    static async deleteTransaction(req: IDeleteTransactionUserRequest, res: Response, next: NextFunction) {
        
        const { id: transactionId } = req.params;
        const { id: ownerId } = req.user;

        await TransactionsService.delete(ownerId, transactionId);

        res.status(httpStatus.NO_CONTENT).send();
    }

    static async getAllTransactions(req: Request, res: Response, next: NextFunction) {

        const transactions = await TransactionsService.findByOwner(req.user);

        res.status(httpStatus.OK).json(transactions);
    }

    static async getStatisticsCategories (req: IStatisticUserRequest, res: Response, next: NextFunction) {
        const { id: ownerId } = req.user;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const month = req.query.month!;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const year = req.query.year!;

        const result = await TransactionsService.getStatisticCategory(ownerId, { month, year });

        res.status(httpStatus.OK).json(result);
    }
}