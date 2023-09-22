import express from 'express';
import asyncHandler from 'express-async-handler';
import { TransactionController } from '../controllers/transactions.controller';
import { AuthMiddlware } from '../middlewares/authMiddleware';
import { validateParams } from '../middlewares/validateParams';
import transactionRules from '../rules/transaction.rules';

const router = express.Router();

router.get('/', AuthMiddlware.isUserAuthorized, asyncHandler(TransactionController.getAllTransactions));
router.get('/categories', AuthMiddlware.isUserAuthorized, validateParams('query', transactionRules.statistic), asyncHandler(TransactionController.getStatisticsCategories));

router.post(
    '/', 
    AuthMiddlware.isUserAuthorized, 
    validateParams('body', transactionRules.add), 
    asyncHandler(TransactionController.addTransactions)
);

router.delete('/:id', AuthMiddlware.isUserAuthorized, asyncHandler(TransactionController.deleteTransaction));

export default router;