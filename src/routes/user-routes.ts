import express from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthMiddlware } from '../middlewares/authMiddleware';
import { validateParams } from '../middlewares/validateParams';
import authRules from '../rules/auth.rules';
import asyncHandler from 'express-async-handler';

const userRouter = express.Router();

userRouter.post('/register', validateParams('body', authRules.register), asyncHandler(AuthController.register));

userRouter.post('/login', validateParams('body', authRules.login), asyncHandler(AuthController.login));

userRouter.get('/logout', AuthMiddlware.isUserAuthorized, asyncHandler(AuthController.logout));

export default userRouter;