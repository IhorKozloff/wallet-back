import request from 'supertest';
import app from '../../../app';
import { existingUser, existingUserObjectId, existingUserToken, setExistingUser, setUsersInDB } from '../fixtures/auth-service.fixtures';
import { defaultIncomeTransaction, defaultIncomeTransactionId, defaultExpenceTransaction, defaultExpenceTransactionId, setDefaultTransactions, setTransactionsInDB } from '../fixtures/transactions.fixtures';
import { setDatabaseConnection } from '../utils/setDatabaseConnection';
import { setMockSettings } from '../utils/setMockSettings';
import httpStatus from 'http-status';
import { omit } from 'lodash';
import { TransactionController } from '../../controllers/transactions.controller';
import { AuthMiddlware } from '../../middlewares/authMiddleware';
import { errorMessages } from '../../errors';
import Token from '../../helpers/generateToken';
import { ObjectId } from 'bson';
import { mockReqAndNext } from '../utils/mockAuth';
import util from 'node:util';
import { Transaction } from '../../models/transaction';
import { TransactionsService } from '../../services/transaction.service';
import { User } from '../../models/user';
import { Response, NextFunction } from 'express';

setDatabaseConnection();
setMockSettings();

describe('Transaction Auth:', () => {
    it('Should exec auth middlwere', async () => {
        expect.assertions(1);

        const isUserAuthorized = jest.spyOn(AuthMiddlware, '_isUserAuthorized');

        await request(app).post('/api/wallet-api/transactions');

        expect(isUserAuthorized).toBeCalledTimes(1);
    });

    it('Should throw error about invalid auth header(Authorization header is missing)', async () => {
        
        expect.assertions(2);

        const response = await request(app).post('/api/wallet-api/transactions');

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        expect(response.body).toEqual(expect.objectContaining({
            message: errorMessages.AUTH.INVALID_AUTH_HEADER
        }));
    });

    it('Should throw error about invalid auth header(Authorization header is empty)', async () => {
        
        expect.assertions(2);

        const response = await request(app)
            .post('/api/wallet-api/transactions')
            .set('Authorization', '');
        
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        expect(response.body).toEqual(expect.objectContaining({
            message: errorMessages.AUTH.INVALID_AUTH_HEADER
        }));
    });

    it('Should throw error about invalid auth header(Authorization header do not begining with Bearer)', async () => {
        
        expect.assertions(2);

        const response = await request(app)
            .post('/api/wallet-api/transactions')
            .set('Authorization', 'qwerty token');
        
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        expect(response.body).toEqual(expect.objectContaining({
            message: errorMessages.AUTH.AUTHORIZATION_HEADER_NOT_BEGIN_BEARER
        }));
    });

    it('Should throw error about invalid auth header(Authorization header have invalid token type - empty)', async () => {
        
        expect.assertions(2);

        const response = await request(app)
            .post('/api/wallet-api/transactions')
            .set('Authorization', 'Bearer ');
        
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        expect(response.body).toEqual(expect.objectContaining({
            message: errorMessages.AUTH.TOKEN_IS_BAD
        }));
    });

    it('Should throw error about invalid auth header(Authorization header have invalid token type - not a token at all)', async () => {
        
        expect.assertions(2);

        const response = await request(app)
            .post('/api/wallet-api/transactions')
            .set('Authorization', 'Bearer qqwqwqw');

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        expect(response.body).toEqual(expect.objectContaining({
            message: errorMessages.AUTH.TOKEN_IS_BAD
        }));
    });

    it('Should throw error about invalid auth header(Authorization header have invalid token type - id is missing in token payload)', async () => {
        
        expect.assertions(2);

        const payload = {
            name: 'John'
        };
        const invalidToken = Token.generateAny(payload);

        const response = await request(app)
            .post('/api/wallet-api/transactions')
            .set('Authorization', `Bearer ${invalidToken}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        expect(response.body).toEqual(expect.objectContaining({
            message: errorMessages.AUTH.TOKEN_IS_BAD
        }));
    });

    it('Should throw error about invalid auth header(Authorization header have invalid token - there is no user with id in token payload)', async () => {
        
        expect.assertions(2);

        const invalidToken = Token.generateById(new ObjectId().toHexString());

        const response = await request(app)
            .post('/api/wallet-api/transactions')
            .set('Authorization', `Bearer ${invalidToken}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        expect(response.body).toEqual(expect.objectContaining({
            message: errorMessages.AUTH.NOT_AUTHORIZED
        }));
    });
});
describe('POST:/api/wallet-api/transactions/', () => {
    it('Should return status CREATED and added transaction data', async () => {

        await setUsersInDB([
            {
                ...existingUser,
                token: existingUserToken
            }
        ]);

        expect.assertions(3);
        const addTransactions = jest.spyOn(TransactionController, '_addTransactions'); 

        const result = await request(app)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${existingUserToken}`)
            .send(defaultExpenceTransaction);

        expect(addTransactions).toBeCalled();
        expect(result.status).toBe(httpStatus.CREATED);
        expect(result.body).toEqual(expect.objectContaining({
            ...defaultExpenceTransaction,
            owner: {
                name: existingUser.name,
                email: existingUser.email
            }
        }));

    });

    it('Should return status BAD_REQUEST and error message - "date" is required (date is missing)', async () => {

        await setUsersInDB([
            {
                ...existingUser,
                token: existingUserToken
            }
        ]);

        const result = await request(app)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${existingUserToken}`)
            .send({
                ...omit(defaultExpenceTransaction, 'date')
            });

        expect(result.status).toBe(httpStatus.BAD_REQUEST);
        expect(result.body.message).toEqual(
            expect.stringContaining('"date" is required')
        );
    });

    it('Should return status BAD_REQUEST and error message - "date.day" is required (date day is missing)', async () => {

        await setUsersInDB([
            {
                ...existingUser,
                token: existingUserToken
            }
        ]);

        const result = await request(app)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${existingUserToken}`)
            .send({
                ...defaultExpenceTransaction,
                date: omit(defaultExpenceTransaction.date, 'day')
            });

        expect(result.status).toBe(httpStatus.BAD_REQUEST);
        expect(result.body.message).toEqual(
            expect.stringContaining('"date.day" is required')
        );
    });

    it('Should return status BAD_REQUEST and error message - "date.day" must be a number (date day is not a number)', async () => {

        await setUsersInDB([
            {
                ...existingUser,
                token: existingUserToken
            }
        ]);

        const result = await request(app)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${existingUserToken}`)
            .send({
                ...defaultExpenceTransaction,
                date: {
                    ...defaultExpenceTransaction.date,
                    day: 'qwerty'
                }
            });

        expect(result.status).toBe(httpStatus.BAD_REQUEST);
        expect(result.body.message).toEqual(
            expect.stringContaining('"date.day" must be a number')
        );
    });

    it('Should return status BAD_REQUEST and error message - "date.day" must be greater than or equal to 1 (date day is less then own minimum)', async () => {

        await setUsersInDB([
            {
                ...existingUser,
                token: existingUserToken
            }
        ]);

        const result = await request(app)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${existingUserToken}`)
            .send({
                ...defaultExpenceTransaction,
                date: {
                    ...defaultExpenceTransaction.date,
                    day: 0
                }
            });

        expect(result.status).toBe(httpStatus.BAD_REQUEST);
        expect(result.body.message).toEqual(
            expect.stringContaining('"date.day" must be greater than or equal to 1')
        );
    });

    it('Should return status BAD_REQUEST and error message - "date.day"  must be less than or equal to 31 (date day is greter then own maximum)', async () => {

        await setUsersInDB([
            {
                ...existingUser,
                token: existingUserToken
            }
        ]);

        const result = await request(app)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${existingUserToken}`)
            .send({
                ...defaultExpenceTransaction,
                date: {
                    ...defaultExpenceTransaction.date,
                    day: 32
                }
            });
        
        expect(result.status).toBe(httpStatus.BAD_REQUEST);
        expect(result.body.message).toEqual(
            expect.stringContaining('"date.day" must be less than or equal to 31')
        );
    });

    it('Should return status BAD_REQUEST and error message - "date.day" must be an integer (date day is not integer)', async () => {

        await setUsersInDB([
            {
                ...existingUser,
                token: existingUserToken
            }
        ]);

        const result = await request(app)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${existingUserToken}`)
            .send({
                ...defaultExpenceTransaction,
                date: {
                    ...defaultExpenceTransaction.date,
                    day: 15.2
                }
            });
        
        expect(result.status).toBe(httpStatus.BAD_REQUEST);
        expect(result.body.message).toEqual(
            expect.stringContaining('"date.day" must be an integer')
        );
    });

    it('Should return status BAD_REQUEST and error message - "date.month" is required (date month is missing)', async () => {

        await setUsersInDB([
            {
                ...existingUser,
                token: existingUserToken
            }
        ]);

        const result = await request(app)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${existingUserToken}`)
            .send({
                ...defaultExpenceTransaction,
                date: omit(defaultExpenceTransaction.date, 'month')
            });

        expect(result.status).toBe(httpStatus.BAD_REQUEST);
        expect(result.body.message).toEqual(
            expect.stringContaining('"date.month" is required')
        );
    });

    it('Should return status BAD_REQUEST and error message - "date.month" must be a number (date month is not a number)', async () => {

        await setUsersInDB([
            {
                ...existingUser,
                token: existingUserToken
            }
        ]);

        const result = await request(app)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${existingUserToken}`)
            .send({
                ...defaultExpenceTransaction,
                date: {
                    ...defaultExpenceTransaction.date,
                    month: 'qwerty'
                }
            });

        expect(result.status).toBe(httpStatus.BAD_REQUEST);
        expect(result.body.message).toEqual(
            expect.stringContaining('"date.month" must be a number')
        );
    });

    it('Should return status BAD_REQUEST and error message - "date.month" must be greater than or equal to 1 (date month is less then own minimum)', async () => {

        await setUsersInDB([
            {
                ...existingUser,
                token: existingUserToken
            }
        ]);

        const result = await request(app)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${existingUserToken}`)
            .send({
                ...defaultExpenceTransaction,
                date: {
                    ...defaultExpenceTransaction.date,
                    month: 0
                }
            });

        expect(result.status).toBe(httpStatus.BAD_REQUEST);
        expect(result.body.message).toEqual(
            expect.stringContaining('"date.month" must be greater than or equal to 1')
        );
    });

    it('Should return status BAD_REQUEST and error message - "date.month"  must be less than or equal to 12 (date month is greter then own maximum)', async () => {

        await setUsersInDB([
            {
                ...existingUser,
                token: existingUserToken
            }
        ]);

        const result = await request(app)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${existingUserToken}`)
            .send({
                ...defaultExpenceTransaction,
                date: {
                    ...defaultExpenceTransaction.date,
                    month: 32
                }
            });
        
        expect(result.status).toBe(httpStatus.BAD_REQUEST);
        expect(result.body.message).toEqual(
            expect.stringContaining('"date.month" must be less than or equal to 12')
        );
    });

    it('Should return status BAD_REQUEST and error message - "date.month" must be an integer (date month is not integer)', async () => {

        await setUsersInDB([
            {
                ...existingUser,
                token: existingUserToken
            }
        ]);

        const result = await request(app)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${existingUserToken}`)
            .send({
                ...defaultExpenceTransaction,
                date: {
                    ...defaultExpenceTransaction.date,
                    month: 5.2
                }
            });
        
        expect(result.status).toBe(httpStatus.BAD_REQUEST);
        expect(result.body.message).toEqual(
            expect.stringContaining('"date.month" must be an integer')
        );
    });
    //
    it('Should return status BAD_REQUEST and error message - "date.year" is required (date year is missing)', async () => {

        await setUsersInDB([
            {
                ...existingUser,
                token: existingUserToken
            }
        ]);

        const result = await request(app)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${existingUserToken}`)
            .send({
                ...defaultExpenceTransaction,
                date: omit(defaultExpenceTransaction.date, 'year')
            });

        expect(result.status).toBe(httpStatus.BAD_REQUEST);
        expect(result.body.message).toEqual(
            expect.stringContaining('"date.year" is required')
        );
    });

    it('Should return status BAD_REQUEST and error message - "date.year" must be a number (date year is not a number)', async () => {

        await setUsersInDB([
            {
                ...existingUser,
                token: existingUserToken
            }
        ]);

        const result = await request(app)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${existingUserToken}`)
            .send({
                ...defaultExpenceTransaction,
                date: {
                    ...defaultExpenceTransaction.date,
                    year: 'qwerty'
                }
            });

        expect(result.status).toBe(httpStatus.BAD_REQUEST);
        expect(result.body.message).toEqual(
            expect.stringContaining('"date.year" must be a number')
        );
    });

    it('Should return status BAD_REQUEST and error message - "date.year" must be greater than or equal to 1970 (date year is less then own minimum)', async () => {

        await setUsersInDB([
            {
                ...existingUser,
                token: existingUserToken
            }
        ]);

        const result = await request(app)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${existingUserToken}`)
            .send({
                ...defaultExpenceTransaction,
                date: {
                    ...defaultExpenceTransaction.date,
                    year: 0
                }
            });

        expect(result.status).toBe(httpStatus.BAD_REQUEST);
        expect(result.body.message).toEqual(
            expect.stringContaining('"date.year" must be greater than or equal to 1970')
        );
    });

    it('Should return status BAD_REQUEST and error message - "date.year"  must be less than or equal to 9999 (date year is greter then own maximum)', async () => {

        await setUsersInDB([
            {
                ...existingUser,
                token: existingUserToken
            }
        ]);

        const result = await request(app)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${existingUserToken}`)
            .send({
                ...defaultExpenceTransaction,
                date: {
                    ...defaultExpenceTransaction.date,
                    year: 323232
                }
            });
        
        expect(result.status).toBe(httpStatus.BAD_REQUEST);
        expect(result.body.message).toEqual(
            expect.stringContaining('"date.year" must be less than or equal to 9999')
        );
    });

    it('Should return status BAD_REQUEST and error message - "date.year" must be an integer (date year is not integer)', async () => {

        await setUsersInDB([
            {
                ...existingUser,
                token: existingUserToken
            }
        ]);

        const result = await request(app)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${existingUserToken}`)
            .send({
                ...defaultExpenceTransaction,
                date: {
                    ...defaultExpenceTransaction.date,
                    year: 2025.2
                }
            });
        
        expect(result.status).toBe(httpStatus.BAD_REQUEST);
        expect(result.body.message).toEqual(
            expect.stringContaining('"date.year" must be an integer')
        );
    });
    //type

    it('Should return status BAD_REQUEST and error message - "type" is required (type is missing)', async () => {

        await setUsersInDB([
            {
                ...existingUser,
                token: existingUserToken
            }
        ]);

        const result = await request(app)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${existingUserToken}`)
            .send({
                ...omit(defaultExpenceTransaction, 'type'),
            });
        
        expect(result.status).toBe(httpStatus.BAD_REQUEST);
        expect(result.body.message).toEqual(
            expect.stringContaining('"type" is required')
        );
    });

    it('Should return status BAD_REQUEST and error message - must be one of [income, expense] (type is not a string)', async () => {

        await setUsersInDB([
            {
                ...existingUser,
                token: existingUserToken
            }
        ]);

        const result = await request(app)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${existingUserToken}`)
            .send({
                ...defaultExpenceTransaction,
                type: 12
            });
        
        expect(result.status).toBe(httpStatus.BAD_REQUEST);
        expect(result.body.message).toEqual(
            expect.stringContaining('"type" must be one of [income, expense]')
        );
    });

    it('Should return status BAD_REQUEST and error message - must be one of [income, expense] (type is not assignable string)', async () => {

        await setUsersInDB([
            {
                ...existingUser,
                token: existingUserToken
            }
        ]);

        const result = await request(app)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${existingUserToken}`)
            .send({
                ...defaultExpenceTransaction,
                type: 'qwerty'
            });
        
        expect(result.status).toBe(httpStatus.BAD_REQUEST);
        expect(result.body.message).toEqual(
            expect.stringContaining('"type" must be one of [income, expense]')
        );
    });
    //category

    it('Should return status BAD_REQUEST and error message - "category" is required (category is missing)', async () => {

        await setUsersInDB([
            {
                ...existingUser,
                token: existingUserToken
            }
        ]);

        const result = await request(app)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${existingUserToken}`)
            .send({
                ...omit(defaultExpenceTransaction, 'category')
            });
        
        expect(result.status).toBe(httpStatus.BAD_REQUEST);
        expect(result.body.message).toEqual(
            expect.stringContaining('"category" is required')
        );
    });

    it('Should return status BAD_REQUEST and error message - "category" must be one of ... (category is not a string)', async () => {

        await setUsersInDB([
            {
                ...existingUser,
                token: existingUserToken
            }
        ]);

        const result = await request(app)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${existingUserToken}`)
            .send({
                ...defaultExpenceTransaction,
                category: 12
            });
        
        expect(result.status).toBe(httpStatus.BAD_REQUEST);
        expect(result.body.message).toEqual(
            expect.stringContaining('"category" must be one of [main, house, children, development, food, basic, products, car, health, child care, household, education, leisure, other, salary]')
        );
    });

    it('Should return status BAD_REQUEST and error message - "category" must be one of ... (category is not assignable string)', async () => {

        await setUsersInDB([
            {
                ...existingUser,
                token: existingUserToken
            }
        ]);

        const result = await request(app)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${existingUserToken}`)
            .send({
                ...defaultExpenceTransaction,
                category: 'qwerty'
            });
        
        expect(result.status).toBe(httpStatus.BAD_REQUEST);
        expect(result.body.message).toEqual(
            expect.stringContaining('"category" must be one of [main, house, children, development, food, basic, products, car, health, child care, household, education, leisure, other, salary]')
        );
    });
    //comment
    it('Should return status CREATED, and data with comment to equal empty string (comment is missing)', async () => {

        await setUsersInDB([
            {
                ...existingUser,
                token: existingUserToken
            }
        ]);

        const result = await request(app)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${existingUserToken}`)
            .send({
                ...omit(defaultExpenceTransaction, 'comment'),
            });

        expect(result.status).toBe(httpStatus.CREATED);
        expect(result.body).toEqual(expect.objectContaining({
            comment: ''
        }));
    });

    it('Should return status BAD_REQUEST and error message - "comment" must be a string (comment is not a string)', async () => {

        await setUsersInDB([
            {
                ...existingUser,
                token: existingUserToken
            }
        ]);

        const result = await request(app)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${existingUserToken}`)
            .send({
                ...defaultExpenceTransaction,
                comment: false
            });

        expect(result.status).toBe(httpStatus.BAD_REQUEST);
        expect(result.body.message).toEqual(
            expect.stringContaining('"comment" must be a string')
        );
    });
    //summ
    it('Should return status BAD_REQUEST and error message - "sum" is required (sum is missing)', async () => {

        await setUsersInDB([
            {
                ...existingUser,
                token: existingUserToken
            }
        ]);

        const result = await request(app)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${existingUserToken}`)
            .send({
                ...omit(defaultExpenceTransaction, 'sum')
            });
        
        expect(result.status).toBe(httpStatus.BAD_REQUEST);
        expect(result.body.message).toEqual(
            expect.stringContaining('"sum" is required')
        );
    });

    it('Should return status BAD_REQUEST and error message - "sum" must be a number (sum is not a number)', async () => {

        await setUsersInDB([
            {
                ...existingUser,
                token: existingUserToken
            }
        ]);

        const result = await request(app)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${existingUserToken}`)
            .send({
                ...defaultExpenceTransaction,
                sum: 'qwerty'
            });
        
        expect(result.status).toBe(httpStatus.BAD_REQUEST);
        expect(result.body.message).toEqual(
            expect.stringContaining('"sum" must be a number')
        );
    });

    it('Should return status BAD_REQUEST and error message - "sum" must be greater than or equal to 0 (sum is less then own minimum)', async () => {

        await setUsersInDB([
            {
                ...existingUser,
                token: existingUserToken
            }
        ]);

        const result = await request(app)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${existingUserToken}`)
            .send({
                ...defaultExpenceTransaction,
                sum: -12.123
            });
        
        expect(result.status).toBe(httpStatus.BAD_REQUEST);
        expect(result.body.message).toEqual(
            expect.stringContaining('"sum" must be greater than or equal to 0')
        );
    });

    it('Should return status CREATED and object with property sum and its value must have 2 decimal characters)', async () => {

        await setUsersInDB([
            {
                ...existingUser,
                token: existingUserToken
            }
        ]);
        expect.assertions(3);
        const addTransactions = jest.spyOn(TransactionController, '_addTransactions');

        const result = await request(app)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${existingUserToken}`)
            .send({
                ...defaultExpenceTransaction,
                sum: 12.123121212
            });
        
        expect(addTransactions).toBeCalled();
        expect(result.status).toBe(httpStatus.CREATED);
        expect(result.body).toEqual(
            expect.objectContaining({
                sum: 12.12
            })
        );
    });
});

describe('GET:/api/wallet-api/transactions/', () => {
    it('Should return all transactions (filter is default)', async () => {
        await Promise.all([
            setExistingUser(),
            setDefaultTransactions()
        ]);

        expect.assertions(4);

        mockReqAndNext({
            name: existingUser.name,
            email: existingUser.email,
            id: existingUserObjectId
        });

        const result = await request(app)
            .get('/api/wallet-api/transactions');

        expect(result.status).toBe(httpStatus.OK);
        expect(result.body.length).toBe(2);
        expect(result.body).toEqual(expect.arrayContaining(
            [
                expect.objectContaining({
                    ...defaultExpenceTransaction,
                    id: defaultExpenceTransactionId.toHexString(),
                    owner: {
                        name: existingUser.name,
                        email: existingUser.email,
                    }
                })
            ]
        ));

        expect(result.body).toEqual(expect.arrayContaining(
            [
                expect.objectContaining({
                    ...defaultIncomeTransaction,
                    id: defaultIncomeTransactionId.toHexString(),
                    owner: {
                        name: existingUser.name,
                        email: existingUser.email,
                    }
                })
            ]
        ));
    });
    it('Should return status OK and empty array, there is no one transaction in database (filter is default)', async () => {
        await setExistingUser();

        expect.assertions(2);

        mockReqAndNext({
            name: existingUser.name,
            email: existingUser.email,
            id: existingUserObjectId
        });

        const result = await request(app)
            .get('/api/wallet-api/transactions');

        expect(result.status).toBe(httpStatus.OK);
        expect(result.body.length).toBe(0);
    });
});

describe('DELETE:/api/wallet-api/transactions/', () => {
    
    it('Should return status NO_CONTENT', async () => {
        await Promise.all([
            setExistingUser(),
            setDefaultTransactions()
        ]);

        expect.assertions(2);

        const deleteService = jest.spyOn(TransactionsService, 'delete');

        mockReqAndNext({
            name: existingUser.name,
            email: existingUser.email,
            id: existingUserObjectId
        });

        const result = await request(app)
            .delete(`/api/wallet-api/transactions/${defaultExpenceTransactionId.toHexString()}`);

        expect(deleteService).toBeCalledWith(existingUserObjectId, defaultExpenceTransactionId.toHexString());
        expect(result.status).toBe(httpStatus.NO_CONTENT);
    });

    it('Should status NOT_FOUND, transaction with this id is not exist', async () => {
        await Promise.all([
            setExistingUser(),
            setDefaultTransactions()
        ]);

        expect.assertions(3);

        const deleteService = jest.spyOn(TransactionsService, 'delete');

        mockReqAndNext({
            name: existingUser.name,
            email: existingUser.email,
            id: existingUserObjectId
        });
        const invalidTransactionId = new ObjectId().toHexString();
        const result = await request(app)
            .delete(`/api/wallet-api/transactions/${invalidTransactionId}`);

        expect(deleteService).toBeCalledWith(existingUserObjectId, invalidTransactionId);
        expect(result.status).toBe(httpStatus.NOT_FOUND);
        expect(result.body).toEqual(expect.objectContaining({
            message: util.format(errorMessages.TRANSACTIONS.TRANSACTION_NOT_FOUND, invalidTransactionId)
        }));
    });

    it('Should status INTERNAL_SERVER_ERROR, something wrong at database process', async () => {
        await Promise.all([
            setExistingUser(),
            setDefaultTransactions()
        ]);

        expect.assertions(3);

        jest.spyOn(Transaction, 'findByIdAndRemove').mockResolvedValue(false);
        const deleteService = jest.spyOn(TransactionsService, 'delete');
        
        mockReqAndNext({
            name: existingUser.name,
            email: existingUser.email,
            id: existingUserObjectId
        });

        const result = await request(app)
            .delete(`/api/wallet-api/transactions/${defaultExpenceTransactionId.toHexString()}`);

        expect(deleteService).toBeCalledWith(existingUserObjectId, defaultExpenceTransactionId.toHexString());
        expect(result.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
        expect(result.body).toEqual(expect.objectContaining({
            message: errorMessages.GENERAL.DATABASE_PROCESS_WAS_FAILED
        }));
    });
});

describe('GET:/api/wallet-api/transactions/categories', () => {
    it('Should return all users transactions by category, filter params are default', async () => {
        await Promise.all([
            setExistingUser(),
            setDefaultTransactions()
        ]);

        expect.assertions(3);

        mockReqAndNext({
            name: existingUser.name,
            email: existingUser.email,
            id: existingUserObjectId
        });

        const categoryService = jest.spyOn(TransactionsService, 'getStatisticCategory');

        const result = await request(app)
            .get('/api/wallet-api/transactions/categories');

        expect(result.status).toBe(httpStatus.OK);
        expect(result.body).toEqual(expect.objectContaining({
            expense: [{
                total: 400, 
                categoryType: 'food'
            }],
            income: {
                total: 100
            }
        }));
        expect(categoryService).toBeCalledWith(
            existingUserObjectId,
            {
                month: 'all',
                year: 'all'
            }
        );
    });
    it('Should return status OK and data found by filter params (month: 9, year - default )', async () => {
        await Promise.all([
            setExistingUser(),
            setDefaultTransactions(),
            setTransactionsInDB([
                {
                    ...defaultExpenceTransaction,
                    id: new ObjectId(),
                    owner: existingUserObjectId,
                    date: {
                        ...defaultExpenceTransaction.date,
                        month: 10,
                    }
                }
            ]),

        ]);


        expect.assertions(4);

        mockReqAndNext({
            name: existingUser.name,
            email: existingUser.email,
            id: existingUserObjectId
        });

        const getStatisticCategory = jest.spyOn(TransactionsService,'getStatisticCategory');

        const result = await request(app)
            .get('/api/wallet-api/transactions/categories?month=9');


        expect(result.status).toBe(httpStatus.OK);
        expect(result.body).toEqual(expect.objectContaining({
            expense: [{
                total: 400, 
                categoryType: 'food'
            }],
        }));
        expect(result.body.expense.length).toBe(1);

        expect(getStatisticCategory).toBeCalledWith(
            existingUserObjectId,
            {
                month: 9,
                year: 'all'
            }
        );
    });

    it('Should return status OK and data found by filter params (month: all, year - 2022 )', async () => {
        await Promise.all([
            setExistingUser(),
            setDefaultTransactions(),
            setTransactionsInDB([
                {
                    ...defaultExpenceTransaction,
                    id: new ObjectId(),
                    owner: existingUserObjectId,
                    date: {
                        ...defaultExpenceTransaction.date,
                        year: 2023,
                    }
                }
            ]),

        ]);


        expect.assertions(4);

        mockReqAndNext({
            name: existingUser.name,
            email: existingUser.email,
            id: existingUserObjectId
        });

        const getStatisticCategory = jest.spyOn(TransactionsService,'getStatisticCategory');

        const result = await request(app)
            .get('/api/wallet-api/transactions/categories?year=2022');


        expect(result.status).toBe(httpStatus.OK);
        expect(result.body).toEqual(expect.objectContaining({
            expense: [{
                total: 400, 
                categoryType: 'food'
            }],
        }));
        expect(result.body.expense.length).toBe(1);

        expect(getStatisticCategory).toBeCalledWith(
            existingUserObjectId,
            {
                month: 'all',
                year: 2022
            }
        );
    });

    it('Should return status OK and data found by filter params (month: 9, year - 2022 )', async () => {
        await Promise.all([
            setExistingUser(),
            setDefaultTransactions(),
            setTransactionsInDB([
                {
                    ...defaultExpenceTransaction,
                    id: new ObjectId(),
                    owner: existingUserObjectId,
                    category: 'child care',
                    date: {
                        ...defaultExpenceTransaction.date,
                        year: 2023,
                    }
                },
                {
                    ...defaultExpenceTransaction,
                    id: new ObjectId(),
                    owner: existingUserObjectId,
                    category: 'car',
                    date: {
                        ...defaultExpenceTransaction.date,
                        month: 10,
                    }
                }
            ]),

        ]);


        expect.assertions(4);

        mockReqAndNext({
            name: existingUser.name,
            email: existingUser.email,
            id: existingUserObjectId
        });

        const getStatisticCategory = jest.spyOn(TransactionsService,'getStatisticCategory');

        const result = await request(app)
            .get('/api/wallet-api/transactions/categories?month=9&year=2022');


        expect(result.status).toBe(httpStatus.OK);
        expect(result.body).toEqual(expect.objectContaining({
            expense: [{
                total: 400, 
                categoryType: 'food'
            }],
        }));
        expect(result.body.expense.length).toBe(1);

        expect(getStatisticCategory).toBeCalledWith(
            existingUserObjectId,
            {
                month: 9,
                year: 2022
            }
        );
    });
});
