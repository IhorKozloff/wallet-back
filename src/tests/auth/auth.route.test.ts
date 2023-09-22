import request from 'supertest';
import app from '../../../app';
import { AuthService } from '../../services/auth.service';
import { defaultUser, existingUser, existingUserAuthData, existingUserObjectId, existingUserToken, fakeData, setExistingUser, setUsersInDB, } from '../fixtures/auth-service.fixtures';
import { omit } from 'lodash';
import { AuthController } from '../../controllers/auth.controller';
import { errorMessages } from '../../errors';
import Token from '../../helpers/generateToken';
import { setDatabaseConnection } from '../utils/setDatabaseConnection';
import { setMockSettings } from '../utils/setMockSettings';
import { ObjectId } from 'bson';
import { AuthMiddlware } from '../../middlewares/authMiddleware';
import httpStatus from 'http-status';

setDatabaseConnection();
setMockSettings();

describe('testing api/auth-api/register route', () => {

    it('Should return status 201, and registered users data', async () => {
        expect.assertions(3);

        const registerService = jest.spyOn(AuthService, 'register');

        const response = await request(app)
            .post('/api/auth-api/register')
            .set('Accept', 'application/json')
            .send(defaultUser);

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
            user: expect.objectContaining({
                ...omit(defaultUser, ['password']),
                token: ''
            })
        });
        expect(registerService).toBeCalledWith(defaultUser);
    });

    it('Should return status 400, and error message. Invalid email (missing @).', async () => {
        expect.assertions(3);

        const invalidData = {
            ...defaultUser,
            email: fakeData.invalid.email
        };

        const registerCtrl = jest.spyOn(AuthController, 'register');

        const response = await request(app)
            .post('/api/auth-api/register')
            .set('Accept', 'application/json')
            .send(invalidData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(expect.objectContaining({
            message: expect.stringContaining(`"email" with value "${invalidData.email}" fails to match the required pattern: /[a-z0-9]+@[a-z]+\\.[a-z]{2,3}/`)
        }));
        expect(registerCtrl).not.toBeCalled();
    });

    it('Should be status 400, and error message. Invalid email (a value is missing).', async () => {
        expect.assertions(3);

        const invalidData = omit(defaultUser, ['email']);

        const registerCtrl = jest.spyOn(AuthController, 'register');

        const response = await request(app)
            .post('/api/auth-api/register')
            .set('Accept', 'application/json')
            .send(invalidData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(expect.objectContaining({
            message: '"email" is required'
        }));
        expect(registerCtrl).not.toBeCalled();
    });

    it('Should be status 400, and error message. Invalid password (password length is less then 6 characters).', async () => {
        expect.assertions(3);

        const invalidData = {
            ...defaultUser,
            password: fakeData.invalid.password
        };

        const registerCtrl = jest.spyOn(AuthController, 'register');

        const response = await request(app)
            .post('/api/auth-api/register')
            .set('Accept', 'application/json')
            .send(invalidData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(expect.objectContaining({
            message: expect.stringContaining('"password" length must be at least 6 characters long')
        }));
        expect(registerCtrl).not.toBeCalled();
    });

    it('Should be status 400, and error message. Invalid password (a value is missing).', async () => {
        expect.assertions(3);

        const registerCtrl = jest.spyOn(AuthController, 'register');

        const invalidData = omit(defaultUser, ['password']);

        const response = await request(app)
            .post('/api/auth-api/register')
            .set('Accept', 'application/json')
            .send(invalidData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(expect.objectContaining({
            message: '"password" is required'
        }));
        expect(registerCtrl).not.toBeCalled();
    });
});

describe('testing api/auth-api/login route', () => {
    it('Should return status 201, and loged in users data', async () => {

        await setExistingUser();
        
        expect.assertions(3);

        const loginService = jest.spyOn(AuthService, 'login');
        jest.spyOn(Token, 'generateById').mockReturnValue(existingUserToken);

        const response = await request(app)
            .post('/api/auth-api/login')
            .set('Accept', 'application/json')
            .send(existingUserAuthData);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(expect.objectContaining({
            ...omit(existingUser, ['password']),
            token: existingUserToken
        }));

        expect(loginService).toBeCalledWith(existingUserAuthData);
    });

    it('Should be status 400, and error message. Invalid email (missing @).', async () => {

        await setExistingUser();
        
        expect.assertions(3);

        const invalidData = {
            ...existingUserAuthData,
            email: fakeData.invalid.email
        };

        const loginService = jest.spyOn(AuthService, 'login');

        const response = await request(app)
            .post('/api/auth-api/login')
            .set('Accept', 'application/json')
            .send(invalidData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(expect.objectContaining({
            message: expect.stringContaining(`"email" with value "${invalidData.email}" fails to match the required pattern: /[a-z0-9]+@[a-z]+\\.[a-z]{2,3}/`)
        }));
        expect(loginService).not.toBeCalled();
    });

    it('Should be status 400, and error message. Invalid email (a value is missing).', async () => {
        expect.assertions(3);

        const invalidData = {
            ...omit(existingUserAuthData, ['email'])
        };

        const loginService = jest.spyOn(AuthService, 'login');

        const response = await request(app)
            .post('/api/auth-api/login')
            .set('Accept', 'application/json')
            .send(invalidData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(expect.objectContaining({
            message: expect.stringContaining('"email" is required')
        }));
        expect(loginService).not.toBeCalled();
    });

    it('Should be status 401, and error message. Invalid email (not found).', async () => {
        expect.assertions(3);
        
        const loginService = jest.spyOn(AuthService, 'login');

        const invalidData = {
            ...existingUserAuthData,
            email: fakeData.unexisting.email
        };

        const response = await request(app)
            .post('/api/auth-api/login')
            .set('Accept', 'application/json')
            .send(invalidData);

        expect(response.statusCode).toBe(401);
        expect(response.body).toEqual(expect.objectContaining({
            message: expect.stringContaining('Email not found!')
        }));

        expect(loginService).toBeCalledWith(invalidData);
    });

    it('Should be status 400, and error message. Invalid password (password length is less then 6 characters).', async () => {
        expect.assertions(3);

        const invalidData = {
            ...existingUserAuthData,
            password: fakeData.invalid.password
        };

        const loginService = jest.spyOn(AuthService, 'login');

        const response = await request(app)
            .post('/api/auth-api/login')
            .set('Accept', 'application/json')
            .send(invalidData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(expect.objectContaining({
            message: expect.stringContaining('"password" length must be at least 6 characters long')
        }));
        expect(loginService).not.toBeCalled();
    });

    it('Should be status 400, and error message. Invalid password (a value is missing).', async () => {
        expect.assertions(3);

        const invalidData = {
            ...omit(existingUserAuthData, ['password'])
        };

        const loginService = jest.spyOn(AuthService, 'login');

        const response = await request(app)
            .post('/api/auth-api/login')
            .set('Accept', 'application/json')
            .send(invalidData);

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(expect.objectContaining({
            message: expect.stringContaining('"password" is required')
        }));
        expect(loginService).not.toBeCalled();
    });

    it('Should be status 401, and error message. Invalid password (wrong password).', async () => {

        await setExistingUser();

        expect.assertions(3);

        const invalidData = {
            ...existingUserAuthData,
            password: fakeData.unexisting.password
        };
        
        const loginService = jest.spyOn(AuthService, 'login');

        const response = await request(app)
            .post('/api/auth-api/login')
            .set('Accept', 'application/json')
            .send(invalidData);

        expect(response.statusCode).toBe(401);
        expect(response.body).toEqual(expect.objectContaining({
            message: expect.stringContaining(errorMessages.AUTH.WRONG_PASSWORD)
        }));

        expect(loginService).toBeCalledWith(invalidData);
    });
});

describe('Logout Auth:', () => {
    it('Should exec auth middlwere', async () => {
        expect.assertions(1);

        const isUserAuthorized = jest.spyOn(AuthMiddlware, '_isUserAuthorized');

        await request(app).get('/api/auth-api/logout');

        expect(isUserAuthorized).toBeCalledTimes(1);
    });

    it('Should throw error about invalid auth header(Authorization header is missing)', async () => {
        
        expect.assertions(2);

        const response = await request(app).get('/api/auth-api/logout');

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        expect(response.body).toEqual(expect.objectContaining({
            message: errorMessages.AUTH.INVALID_AUTH_HEADER
        }));
    });

    it('Should throw error about invalid auth header(Authorization header is empty)', async () => {
        
        expect.assertions(2);

        const response = await request(app)
            .get('/api/auth-api/logout')
            .set('Authorization', '');
        
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        expect(response.body).toEqual(expect.objectContaining({
            message: errorMessages.AUTH.INVALID_AUTH_HEADER
        }));
    });

    it('Should throw error about invalid auth header(Authorization header do not begining with Bearer)', async () => {
        
        expect.assertions(2);

        const response = await request(app)
            .get('/api/auth-api/logout')
            .set('Authorization', 'qwerty token');
        
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        expect(response.body).toEqual(expect.objectContaining({
            message: errorMessages.AUTH.AUTHORIZATION_HEADER_NOT_BEGIN_BEARER
        }));
    });

    it('Should throw error about invalid auth header(Authorization header have invalid token type - empty)', async () => {
        
        expect.assertions(2);

        const response = await request(app)
            .get('/api/auth-api/logout')
            .set('Authorization', 'Bearer ');
        
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        expect(response.body).toEqual(expect.objectContaining({
            message: errorMessages.AUTH.TOKEN_IS_BAD
        }));
    });

    it('Should throw error about invalid auth header(Authorization header have invalid token type - not a token at all)', async () => {
        
        expect.assertions(2);

        const response = await request(app)
            .get('/api/auth-api/logout')
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
            .get('/api/auth-api/logout')
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
            .get('/api/auth-api/logout')
            .set('Authorization', `Bearer ${invalidToken}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        expect(response.body).toEqual(expect.objectContaining({
            message: errorMessages.AUTH.NOT_AUTHORIZED
        }));
    });
});
describe('testing api/auth-api/logout route', () => {
    it('Should return status 204', async () => {

        await setUsersInDB([{
            ...existingUser,
            token: existingUserToken
        }]);

        const response = await request(app)
            .get('/api/auth-api/logout')
            .set('Authorization', `Bearer ${existingUserToken}`);

        expect(response.status).toBe(204);
        expect(response.body).toEqual({});
    });
});