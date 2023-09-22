import express, { NextFunction, Request, Response } from 'express';
import transactionsRouter from './transactionsRoutes';
import userRouter from './user-routes';
import dragonReviewerUserDataRouter from './dragon-reviewer-user-data-router';

const router = express.Router();

router.use('/wallet-api/transactions', transactionsRouter);

router.use('/auth-api', userRouter);

router.use('/dragon-api/', dragonReviewerUserDataRouter);

export default router;