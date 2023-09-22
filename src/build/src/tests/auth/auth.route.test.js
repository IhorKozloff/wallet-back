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
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../../app"));
const auth_service_1 = require("../../services/auth.service");
const auth_service_fixtures_1 = require("../fixtures/auth-service.fixtures");
const lodash_1 = require("lodash");
const auth_controller_1 = require("../../controllers/auth.controller");
const errors_1 = require("../../errors");
const generateToken_1 = __importDefault(require("../../helpers/generateToken"));
const setDatabaseConnection_1 = require("../utils/setDatabaseConnection");
const setMockSettings_1 = require("../utils/setMockSettings");
const bson_1 = require("bson");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const http_status_1 = __importDefault(require("http-status"));
(0, setDatabaseConnection_1.setDatabaseConnection)();
(0, setMockSettings_1.setMockSettings)();
describe('testing api/auth-api/register route', () => {
    it('Should return status 201, and registered users data', () => __awaiter(void 0, void 0, void 0, function* () {
        expect.assertions(3);
        const registerService = jest.spyOn(auth_service_1.AuthService, 'register');
        const response = yield (0, supertest_1.default)(app_1.default)
            .post('/api/auth-api/register')
            .set('Accept', 'application/json')
            .send(auth_service_fixtures_1.defaultUser);
        expect(response.status).toBe(201);
        expect(response.body).toEqual({
            user: expect.objectContaining(Object.assign(Object.assign({}, (0, lodash_1.omit)(auth_service_fixtures_1.defaultUser, ['password'])), { token: '' }))
        });
        expect(registerService).toBeCalledWith(auth_service_fixtures_1.defaultUser);
    }));
    it('Should return status 400, and error message. Invalid email (missing @).', () => __awaiter(void 0, void 0, void 0, function* () {
        expect.assertions(3);
        const invalidData = Object.assign(Object.assign({}, auth_service_fixtures_1.defaultUser), { email: auth_service_fixtures_1.fakeData.invalid.email });
        const registerCtrl = jest.spyOn(auth_controller_1.AuthController, 'register');
        const response = yield (0, supertest_1.default)(app_1.default)
            .post('/api/auth-api/register')
            .set('Accept', 'application/json')
            .send(invalidData);
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(expect.objectContaining({
            message: expect.stringContaining(`"email" with value "${invalidData.email}" fails to match the required pattern: /[a-z0-9]+@[a-z]+\\.[a-z]{2,3}/`)
        }));
        expect(registerCtrl).not.toBeCalled();
    }));
    it('Should be status 400, and error message. Invalid email (a value is missing).', () => __awaiter(void 0, void 0, void 0, function* () {
        expect.assertions(3);
        const invalidData = (0, lodash_1.omit)(auth_service_fixtures_1.defaultUser, ['email']);
        const registerCtrl = jest.spyOn(auth_controller_1.AuthController, 'register');
        const response = yield (0, supertest_1.default)(app_1.default)
            .post('/api/auth-api/register')
            .set('Accept', 'application/json')
            .send(invalidData);
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(expect.objectContaining({
            message: '"email" is required'
        }));
        expect(registerCtrl).not.toBeCalled();
    }));
    it('Should be status 400, and error message. Invalid password (password length is less then 6 characters).', () => __awaiter(void 0, void 0, void 0, function* () {
        expect.assertions(3);
        const invalidData = Object.assign(Object.assign({}, auth_service_fixtures_1.defaultUser), { password: auth_service_fixtures_1.fakeData.invalid.password });
        const registerCtrl = jest.spyOn(auth_controller_1.AuthController, 'register');
        const response = yield (0, supertest_1.default)(app_1.default)
            .post('/api/auth-api/register')
            .set('Accept', 'application/json')
            .send(invalidData);
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(expect.objectContaining({
            message: expect.stringContaining('"password" length must be at least 6 characters long')
        }));
        expect(registerCtrl).not.toBeCalled();
    }));
    it('Should be status 400, and error message. Invalid password (a value is missing).', () => __awaiter(void 0, void 0, void 0, function* () {
        expect.assertions(3);
        const registerCtrl = jest.spyOn(auth_controller_1.AuthController, 'register');
        const invalidData = (0, lodash_1.omit)(auth_service_fixtures_1.defaultUser, ['password']);
        const response = yield (0, supertest_1.default)(app_1.default)
            .post('/api/auth-api/register')
            .set('Accept', 'application/json')
            .send(invalidData);
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(expect.objectContaining({
            message: '"password" is required'
        }));
        expect(registerCtrl).not.toBeCalled();
    }));
});
describe('testing api/auth-api/login route', () => {
    it('Should return status 201, and loged in users data', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, auth_service_fixtures_1.setExistingUser)();
        expect.assertions(3);
        const loginService = jest.spyOn(auth_service_1.AuthService, 'login');
        jest.spyOn(generateToken_1.default, 'generateById').mockReturnValue(auth_service_fixtures_1.existingUserToken);
        const response = yield (0, supertest_1.default)(app_1.default)
            .post('/api/auth-api/login')
            .set('Accept', 'application/json')
            .send(auth_service_fixtures_1.existingUserAuthData);
        expect(response.status).toBe(200);
        expect(response.body).toEqual(expect.objectContaining(Object.assign(Object.assign({}, (0, lodash_1.omit)(auth_service_fixtures_1.existingUser, ['password'])), { token: auth_service_fixtures_1.existingUserToken })));
        expect(loginService).toBeCalledWith(auth_service_fixtures_1.existingUserAuthData);
    }));
    it('Should be status 400, and error message. Invalid email (missing @).', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, auth_service_fixtures_1.setExistingUser)();
        expect.assertions(3);
        const invalidData = Object.assign(Object.assign({}, auth_service_fixtures_1.existingUserAuthData), { email: auth_service_fixtures_1.fakeData.invalid.email });
        const loginService = jest.spyOn(auth_service_1.AuthService, 'login');
        const response = yield (0, supertest_1.default)(app_1.default)
            .post('/api/auth-api/login')
            .set('Accept', 'application/json')
            .send(invalidData);
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(expect.objectContaining({
            message: expect.stringContaining(`"email" with value "${invalidData.email}" fails to match the required pattern: /[a-z0-9]+@[a-z]+\\.[a-z]{2,3}/`)
        }));
        expect(loginService).not.toBeCalled();
    }));
    it('Should be status 400, and error message. Invalid email (a value is missing).', () => __awaiter(void 0, void 0, void 0, function* () {
        expect.assertions(3);
        const invalidData = Object.assign({}, (0, lodash_1.omit)(auth_service_fixtures_1.existingUserAuthData, ['email']));
        const loginService = jest.spyOn(auth_service_1.AuthService, 'login');
        const response = yield (0, supertest_1.default)(app_1.default)
            .post('/api/auth-api/login')
            .set('Accept', 'application/json')
            .send(invalidData);
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(expect.objectContaining({
            message: expect.stringContaining('"email" is required')
        }));
        expect(loginService).not.toBeCalled();
    }));
    it('Should be status 401, and error message. Invalid email (not found).', () => __awaiter(void 0, void 0, void 0, function* () {
        expect.assertions(3);
        const loginService = jest.spyOn(auth_service_1.AuthService, 'login');
        const invalidData = Object.assign(Object.assign({}, auth_service_fixtures_1.existingUserAuthData), { email: auth_service_fixtures_1.fakeData.unexisting.email });
        const response = yield (0, supertest_1.default)(app_1.default)
            .post('/api/auth-api/login')
            .set('Accept', 'application/json')
            .send(invalidData);
        expect(response.statusCode).toBe(401);
        expect(response.body).toEqual(expect.objectContaining({
            message: expect.stringContaining('Email not found!')
        }));
        expect(loginService).toBeCalledWith(invalidData);
    }));
    it('Should be status 400, and error message. Invalid password (password length is less then 6 characters).', () => __awaiter(void 0, void 0, void 0, function* () {
        expect.assertions(3);
        const invalidData = Object.assign(Object.assign({}, auth_service_fixtures_1.existingUserAuthData), { password: auth_service_fixtures_1.fakeData.invalid.password });
        const loginService = jest.spyOn(auth_service_1.AuthService, 'login');
        const response = yield (0, supertest_1.default)(app_1.default)
            .post('/api/auth-api/login')
            .set('Accept', 'application/json')
            .send(invalidData);
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(expect.objectContaining({
            message: expect.stringContaining('"password" length must be at least 6 characters long')
        }));
        expect(loginService).not.toBeCalled();
    }));
    it('Should be status 400, and error message. Invalid password (a value is missing).', () => __awaiter(void 0, void 0, void 0, function* () {
        expect.assertions(3);
        const invalidData = Object.assign({}, (0, lodash_1.omit)(auth_service_fixtures_1.existingUserAuthData, ['password']));
        const loginService = jest.spyOn(auth_service_1.AuthService, 'login');
        const response = yield (0, supertest_1.default)(app_1.default)
            .post('/api/auth-api/login')
            .set('Accept', 'application/json')
            .send(invalidData);
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(expect.objectContaining({
            message: expect.stringContaining('"password" is required')
        }));
        expect(loginService).not.toBeCalled();
    }));
    it('Should be status 401, and error message. Invalid password (wrong password).', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, auth_service_fixtures_1.setExistingUser)();
        expect.assertions(3);
        const invalidData = Object.assign(Object.assign({}, auth_service_fixtures_1.existingUserAuthData), { password: auth_service_fixtures_1.fakeData.unexisting.password });
        const loginService = jest.spyOn(auth_service_1.AuthService, 'login');
        const response = yield (0, supertest_1.default)(app_1.default)
            .post('/api/auth-api/login')
            .set('Accept', 'application/json')
            .send(invalidData);
        expect(response.statusCode).toBe(401);
        expect(response.body).toEqual(expect.objectContaining({
            message: expect.stringContaining(errors_1.errorMessages.AUTH.WRONG_PASSWORD)
        }));
        expect(loginService).toBeCalledWith(invalidData);
    }));
});
describe('Logout Auth:', () => {
    it('Should exec auth middlwere', () => __awaiter(void 0, void 0, void 0, function* () {
        expect.assertions(1);
        const isUserAuthorized = jest.spyOn(authMiddleware_1.AuthMiddlware, '_isUserAuthorized');
        yield (0, supertest_1.default)(app_1.default).get('/api/auth-api/logout');
        expect(isUserAuthorized).toBeCalledTimes(1);
    }));
    it('Should throw error about invalid auth header(Authorization header is missing)', () => __awaiter(void 0, void 0, void 0, function* () {
        expect.assertions(2);
        const response = yield (0, supertest_1.default)(app_1.default).get('/api/auth-api/logout');
        expect(response.status).toBe(http_status_1.default.UNAUTHORIZED);
        expect(response.body).toEqual(expect.objectContaining({
            message: errors_1.errorMessages.AUTH.INVALID_AUTH_HEADER
        }));
    }));
    it('Should throw error about invalid auth header(Authorization header is empty)', () => __awaiter(void 0, void 0, void 0, function* () {
        expect.assertions(2);
        const response = yield (0, supertest_1.default)(app_1.default)
            .get('/api/auth-api/logout')
            .set('Authorization', '');
        expect(response.status).toBe(http_status_1.default.UNAUTHORIZED);
        expect(response.body).toEqual(expect.objectContaining({
            message: errors_1.errorMessages.AUTH.INVALID_AUTH_HEADER
        }));
    }));
    it('Should throw error about invalid auth header(Authorization header do not begining with Bearer)', () => __awaiter(void 0, void 0, void 0, function* () {
        expect.assertions(2);
        const response = yield (0, supertest_1.default)(app_1.default)
            .get('/api/auth-api/logout')
            .set('Authorization', 'qwerty token');
        expect(response.status).toBe(http_status_1.default.UNAUTHORIZED);
        expect(response.body).toEqual(expect.objectContaining({
            message: errors_1.errorMessages.AUTH.AUTHORIZATION_HEADER_NOT_BEGIN_BEARER
        }));
    }));
    it('Should throw error about invalid auth header(Authorization header have invalid token type - empty)', () => __awaiter(void 0, void 0, void 0, function* () {
        expect.assertions(2);
        const response = yield (0, supertest_1.default)(app_1.default)
            .get('/api/auth-api/logout')
            .set('Authorization', 'Bearer ');
        expect(response.status).toBe(http_status_1.default.UNAUTHORIZED);
        expect(response.body).toEqual(expect.objectContaining({
            message: errors_1.errorMessages.AUTH.TOKEN_IS_BAD
        }));
    }));
    it('Should throw error about invalid auth header(Authorization header have invalid token type - not a token at all)', () => __awaiter(void 0, void 0, void 0, function* () {
        expect.assertions(2);
        const response = yield (0, supertest_1.default)(app_1.default)
            .get('/api/auth-api/logout')
            .set('Authorization', 'Bearer qqwqwqw');
        expect(response.status).toBe(http_status_1.default.UNAUTHORIZED);
        expect(response.body).toEqual(expect.objectContaining({
            message: errors_1.errorMessages.AUTH.TOKEN_IS_BAD
        }));
    }));
    it('Should throw error about invalid auth header(Authorization header have invalid token type - id is missing in token payload)', () => __awaiter(void 0, void 0, void 0, function* () {
        expect.assertions(2);
        const payload = {
            name: 'John'
        };
        const invalidToken = generateToken_1.default.generateAny(payload);
        const response = yield (0, supertest_1.default)(app_1.default)
            .get('/api/auth-api/logout')
            .set('Authorization', `Bearer ${invalidToken}`);
        expect(response.status).toBe(http_status_1.default.UNAUTHORIZED);
        expect(response.body).toEqual(expect.objectContaining({
            message: errors_1.errorMessages.AUTH.TOKEN_IS_BAD
        }));
    }));
    it('Should throw error about invalid auth header(Authorization header have invalid token - there is no user with id in token payload)', () => __awaiter(void 0, void 0, void 0, function* () {
        expect.assertions(2);
        const invalidToken = generateToken_1.default.generateById(new bson_1.ObjectId().toHexString());
        const response = yield (0, supertest_1.default)(app_1.default)
            .get('/api/auth-api/logout')
            .set('Authorization', `Bearer ${invalidToken}`);
        expect(response.status).toBe(http_status_1.default.UNAUTHORIZED);
        expect(response.body).toEqual(expect.objectContaining({
            message: errors_1.errorMessages.AUTH.NOT_AUTHORIZED
        }));
    }));
});
describe('testing api/auth-api/logout route', () => {
    it('Should return status 204', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, auth_service_fixtures_1.setUsersInDB)([Object.assign(Object.assign({}, auth_service_fixtures_1.existingUser), { token: auth_service_fixtures_1.existingUserToken })]);
        const response = yield (0, supertest_1.default)(app_1.default)
            .get('/api/auth-api/logout')
            .set('Authorization', `Bearer ${auth_service_fixtures_1.existingUserToken}`);
        expect(response.status).toBe(204);
        expect(response.body).toEqual({});
    }));
});
