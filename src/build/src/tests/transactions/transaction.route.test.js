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
const auth_service_fixtures_1 = require("../fixtures/auth-service.fixtures");
const transactions_fixtures_1 = require("../fixtures/transactions.fixtures");
const setDatabaseConnection_1 = require("../utils/setDatabaseConnection");
const setMockSettings_1 = require("../utils/setMockSettings");
const http_status_1 = __importDefault(require("http-status"));
const lodash_1 = require("lodash");
const transactions_controller_1 = require("../../controllers/transactions.controller");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const errors_1 = require("../../errors");
const generateToken_1 = __importDefault(require("../../helpers/generateToken"));
const bson_1 = require("bson");
const mockAuth_1 = require("../utils/mockAuth");
const node_util_1 = __importDefault(require("node:util"));
const transaction_1 = require("../../models/transaction");
const transaction_service_1 = require("../../services/transaction.service");
(0, setDatabaseConnection_1.setDatabaseConnection)();
(0, setMockSettings_1.setMockSettings)();
describe('Transaction Auth:', () => {
    it('Should exec auth middlwere', () => __awaiter(void 0, void 0, void 0, function* () {
        expect.assertions(1);
        const isUserAuthorized = jest.spyOn(authMiddleware_1.AuthMiddlware, '_isUserAuthorized');
        yield (0, supertest_1.default)(app_1.default).post('/api/wallet-api/transactions');
        expect(isUserAuthorized).toBeCalledTimes(1);
    }));
    it('Should throw error about invalid auth header(Authorization header is missing)', () => __awaiter(void 0, void 0, void 0, function* () {
        expect.assertions(2);
        const response = yield (0, supertest_1.default)(app_1.default).post('/api/wallet-api/transactions');
        expect(response.status).toBe(http_status_1.default.UNAUTHORIZED);
        expect(response.body).toEqual(expect.objectContaining({
            message: errors_1.errorMessages.AUTH.INVALID_AUTH_HEADER
        }));
    }));
    it('Should throw error about invalid auth header(Authorization header is empty)', () => __awaiter(void 0, void 0, void 0, function* () {
        expect.assertions(2);
        const response = yield (0, supertest_1.default)(app_1.default)
            .post('/api/wallet-api/transactions')
            .set('Authorization', '');
        expect(response.status).toBe(http_status_1.default.UNAUTHORIZED);
        expect(response.body).toEqual(expect.objectContaining({
            message: errors_1.errorMessages.AUTH.INVALID_AUTH_HEADER
        }));
    }));
    it('Should throw error about invalid auth header(Authorization header do not begining with Bearer)', () => __awaiter(void 0, void 0, void 0, function* () {
        expect.assertions(2);
        const response = yield (0, supertest_1.default)(app_1.default)
            .post('/api/wallet-api/transactions')
            .set('Authorization', 'qwerty token');
        expect(response.status).toBe(http_status_1.default.UNAUTHORIZED);
        expect(response.body).toEqual(expect.objectContaining({
            message: errors_1.errorMessages.AUTH.AUTHORIZATION_HEADER_NOT_BEGIN_BEARER
        }));
    }));
    it('Should throw error about invalid auth header(Authorization header have invalid token type - empty)', () => __awaiter(void 0, void 0, void 0, function* () {
        expect.assertions(2);
        const response = yield (0, supertest_1.default)(app_1.default)
            .post('/api/wallet-api/transactions')
            .set('Authorization', 'Bearer ');
        expect(response.status).toBe(http_status_1.default.UNAUTHORIZED);
        expect(response.body).toEqual(expect.objectContaining({
            message: errors_1.errorMessages.AUTH.TOKEN_IS_BAD
        }));
    }));
    it('Should throw error about invalid auth header(Authorization header have invalid token type - not a token at all)', () => __awaiter(void 0, void 0, void 0, function* () {
        expect.assertions(2);
        const response = yield (0, supertest_1.default)(app_1.default)
            .post('/api/wallet-api/transactions')
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
            .post('/api/wallet-api/transactions')
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
            .post('/api/wallet-api/transactions')
            .set('Authorization', `Bearer ${invalidToken}`);
        expect(response.status).toBe(http_status_1.default.UNAUTHORIZED);
        expect(response.body).toEqual(expect.objectContaining({
            message: errors_1.errorMessages.AUTH.NOT_AUTHORIZED
        }));
    }));
});
describe('POST:/api/wallet-api/transactions/', () => {
    it('Should return status CREATED and added transaction data', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, auth_service_fixtures_1.setUsersInDB)([
            Object.assign(Object.assign({}, auth_service_fixtures_1.existingUser), { token: auth_service_fixtures_1.existingUserToken })
        ]);
        expect.assertions(3);
        const addTransactions = jest.spyOn(transactions_controller_1.TransactionController, '_addTransactions');
        const result = yield (0, supertest_1.default)(app_1.default)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${auth_service_fixtures_1.existingUserToken}`)
            .send(transactions_fixtures_1.defaultExpenceTransaction);
        expect(addTransactions).toBeCalled();
        expect(result.status).toBe(http_status_1.default.CREATED);
        expect(result.body).toEqual(expect.objectContaining(Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction), { owner: {
                name: auth_service_fixtures_1.existingUser.name,
                email: auth_service_fixtures_1.existingUser.email
            } })));
    }));
    it('Should return status BAD_REQUEST and error message - "date" is required (date is missing)', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, auth_service_fixtures_1.setUsersInDB)([
            Object.assign(Object.assign({}, auth_service_fixtures_1.existingUser), { token: auth_service_fixtures_1.existingUserToken })
        ]);
        const result = yield (0, supertest_1.default)(app_1.default)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${auth_service_fixtures_1.existingUserToken}`)
            .send(Object.assign({}, (0, lodash_1.omit)(transactions_fixtures_1.defaultExpenceTransaction, 'date')));
        expect(result.status).toBe(http_status_1.default.BAD_REQUEST);
        expect(result.body.message).toEqual(expect.stringContaining('"date" is required'));
    }));
    it('Should return status BAD_REQUEST and error message - "date.day" is required (date day is missing)', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, auth_service_fixtures_1.setUsersInDB)([
            Object.assign(Object.assign({}, auth_service_fixtures_1.existingUser), { token: auth_service_fixtures_1.existingUserToken })
        ]);
        const result = yield (0, supertest_1.default)(app_1.default)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${auth_service_fixtures_1.existingUserToken}`)
            .send(Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction), { date: (0, lodash_1.omit)(transactions_fixtures_1.defaultExpenceTransaction.date, 'day') }));
        expect(result.status).toBe(http_status_1.default.BAD_REQUEST);
        expect(result.body.message).toEqual(expect.stringContaining('"date.day" is required'));
    }));
    it('Should return status BAD_REQUEST and error message - "date.day" must be a number (date day is not a number)', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, auth_service_fixtures_1.setUsersInDB)([
            Object.assign(Object.assign({}, auth_service_fixtures_1.existingUser), { token: auth_service_fixtures_1.existingUserToken })
        ]);
        const result = yield (0, supertest_1.default)(app_1.default)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${auth_service_fixtures_1.existingUserToken}`)
            .send(Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction), { date: Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction.date), { day: 'qwerty' }) }));
        expect(result.status).toBe(http_status_1.default.BAD_REQUEST);
        expect(result.body.message).toEqual(expect.stringContaining('"date.day" must be a number'));
    }));
    it('Should return status BAD_REQUEST and error message - "date.day" must be greater than or equal to 1 (date day is less then own minimum)', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, auth_service_fixtures_1.setUsersInDB)([
            Object.assign(Object.assign({}, auth_service_fixtures_1.existingUser), { token: auth_service_fixtures_1.existingUserToken })
        ]);
        const result = yield (0, supertest_1.default)(app_1.default)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${auth_service_fixtures_1.existingUserToken}`)
            .send(Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction), { date: Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction.date), { day: 0 }) }));
        expect(result.status).toBe(http_status_1.default.BAD_REQUEST);
        expect(result.body.message).toEqual(expect.stringContaining('"date.day" must be greater than or equal to 1'));
    }));
    it('Should return status BAD_REQUEST and error message - "date.day"  must be less than or equal to 31 (date day is greter then own maximum)', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, auth_service_fixtures_1.setUsersInDB)([
            Object.assign(Object.assign({}, auth_service_fixtures_1.existingUser), { token: auth_service_fixtures_1.existingUserToken })
        ]);
        const result = yield (0, supertest_1.default)(app_1.default)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${auth_service_fixtures_1.existingUserToken}`)
            .send(Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction), { date: Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction.date), { day: 32 }) }));
        expect(result.status).toBe(http_status_1.default.BAD_REQUEST);
        expect(result.body.message).toEqual(expect.stringContaining('"date.day" must be less than or equal to 31'));
    }));
    it('Should return status BAD_REQUEST and error message - "date.day" must be an integer (date day is not integer)', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, auth_service_fixtures_1.setUsersInDB)([
            Object.assign(Object.assign({}, auth_service_fixtures_1.existingUser), { token: auth_service_fixtures_1.existingUserToken })
        ]);
        const result = yield (0, supertest_1.default)(app_1.default)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${auth_service_fixtures_1.existingUserToken}`)
            .send(Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction), { date: Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction.date), { day: 15.2 }) }));
        expect(result.status).toBe(http_status_1.default.BAD_REQUEST);
        expect(result.body.message).toEqual(expect.stringContaining('"date.day" must be an integer'));
    }));
    it('Should return status BAD_REQUEST and error message - "date.month" is required (date month is missing)', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, auth_service_fixtures_1.setUsersInDB)([
            Object.assign(Object.assign({}, auth_service_fixtures_1.existingUser), { token: auth_service_fixtures_1.existingUserToken })
        ]);
        const result = yield (0, supertest_1.default)(app_1.default)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${auth_service_fixtures_1.existingUserToken}`)
            .send(Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction), { date: (0, lodash_1.omit)(transactions_fixtures_1.defaultExpenceTransaction.date, 'month') }));
        expect(result.status).toBe(http_status_1.default.BAD_REQUEST);
        expect(result.body.message).toEqual(expect.stringContaining('"date.month" is required'));
    }));
    it('Should return status BAD_REQUEST and error message - "date.month" must be a number (date month is not a number)', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, auth_service_fixtures_1.setUsersInDB)([
            Object.assign(Object.assign({}, auth_service_fixtures_1.existingUser), { token: auth_service_fixtures_1.existingUserToken })
        ]);
        const result = yield (0, supertest_1.default)(app_1.default)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${auth_service_fixtures_1.existingUserToken}`)
            .send(Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction), { date: Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction.date), { month: 'qwerty' }) }));
        expect(result.status).toBe(http_status_1.default.BAD_REQUEST);
        expect(result.body.message).toEqual(expect.stringContaining('"date.month" must be a number'));
    }));
    it('Should return status BAD_REQUEST and error message - "date.month" must be greater than or equal to 1 (date month is less then own minimum)', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, auth_service_fixtures_1.setUsersInDB)([
            Object.assign(Object.assign({}, auth_service_fixtures_1.existingUser), { token: auth_service_fixtures_1.existingUserToken })
        ]);
        const result = yield (0, supertest_1.default)(app_1.default)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${auth_service_fixtures_1.existingUserToken}`)
            .send(Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction), { date: Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction.date), { month: 0 }) }));
        expect(result.status).toBe(http_status_1.default.BAD_REQUEST);
        expect(result.body.message).toEqual(expect.stringContaining('"date.month" must be greater than or equal to 1'));
    }));
    it('Should return status BAD_REQUEST and error message - "date.month"  must be less than or equal to 12 (date month is greter then own maximum)', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, auth_service_fixtures_1.setUsersInDB)([
            Object.assign(Object.assign({}, auth_service_fixtures_1.existingUser), { token: auth_service_fixtures_1.existingUserToken })
        ]);
        const result = yield (0, supertest_1.default)(app_1.default)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${auth_service_fixtures_1.existingUserToken}`)
            .send(Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction), { date: Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction.date), { month: 32 }) }));
        expect(result.status).toBe(http_status_1.default.BAD_REQUEST);
        expect(result.body.message).toEqual(expect.stringContaining('"date.month" must be less than or equal to 12'));
    }));
    it('Should return status BAD_REQUEST and error message - "date.month" must be an integer (date month is not integer)', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, auth_service_fixtures_1.setUsersInDB)([
            Object.assign(Object.assign({}, auth_service_fixtures_1.existingUser), { token: auth_service_fixtures_1.existingUserToken })
        ]);
        const result = yield (0, supertest_1.default)(app_1.default)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${auth_service_fixtures_1.existingUserToken}`)
            .send(Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction), { date: Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction.date), { month: 5.2 }) }));
        expect(result.status).toBe(http_status_1.default.BAD_REQUEST);
        expect(result.body.message).toEqual(expect.stringContaining('"date.month" must be an integer'));
    }));
    //
    it('Should return status BAD_REQUEST and error message - "date.year" is required (date year is missing)', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, auth_service_fixtures_1.setUsersInDB)([
            Object.assign(Object.assign({}, auth_service_fixtures_1.existingUser), { token: auth_service_fixtures_1.existingUserToken })
        ]);
        const result = yield (0, supertest_1.default)(app_1.default)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${auth_service_fixtures_1.existingUserToken}`)
            .send(Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction), { date: (0, lodash_1.omit)(transactions_fixtures_1.defaultExpenceTransaction.date, 'year') }));
        expect(result.status).toBe(http_status_1.default.BAD_REQUEST);
        expect(result.body.message).toEqual(expect.stringContaining('"date.year" is required'));
    }));
    it('Should return status BAD_REQUEST and error message - "date.year" must be a number (date year is not a number)', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, auth_service_fixtures_1.setUsersInDB)([
            Object.assign(Object.assign({}, auth_service_fixtures_1.existingUser), { token: auth_service_fixtures_1.existingUserToken })
        ]);
        const result = yield (0, supertest_1.default)(app_1.default)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${auth_service_fixtures_1.existingUserToken}`)
            .send(Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction), { date: Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction.date), { year: 'qwerty' }) }));
        expect(result.status).toBe(http_status_1.default.BAD_REQUEST);
        expect(result.body.message).toEqual(expect.stringContaining('"date.year" must be a number'));
    }));
    it('Should return status BAD_REQUEST and error message - "date.year" must be greater than or equal to 1970 (date year is less then own minimum)', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, auth_service_fixtures_1.setUsersInDB)([
            Object.assign(Object.assign({}, auth_service_fixtures_1.existingUser), { token: auth_service_fixtures_1.existingUserToken })
        ]);
        const result = yield (0, supertest_1.default)(app_1.default)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${auth_service_fixtures_1.existingUserToken}`)
            .send(Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction), { date: Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction.date), { year: 0 }) }));
        expect(result.status).toBe(http_status_1.default.BAD_REQUEST);
        expect(result.body.message).toEqual(expect.stringContaining('"date.year" must be greater than or equal to 1970'));
    }));
    it('Should return status BAD_REQUEST and error message - "date.year"  must be less than or equal to 9999 (date year is greter then own maximum)', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, auth_service_fixtures_1.setUsersInDB)([
            Object.assign(Object.assign({}, auth_service_fixtures_1.existingUser), { token: auth_service_fixtures_1.existingUserToken })
        ]);
        const result = yield (0, supertest_1.default)(app_1.default)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${auth_service_fixtures_1.existingUserToken}`)
            .send(Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction), { date: Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction.date), { year: 323232 }) }));
        expect(result.status).toBe(http_status_1.default.BAD_REQUEST);
        expect(result.body.message).toEqual(expect.stringContaining('"date.year" must be less than or equal to 9999'));
    }));
    it('Should return status BAD_REQUEST and error message - "date.year" must be an integer (date year is not integer)', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, auth_service_fixtures_1.setUsersInDB)([
            Object.assign(Object.assign({}, auth_service_fixtures_1.existingUser), { token: auth_service_fixtures_1.existingUserToken })
        ]);
        const result = yield (0, supertest_1.default)(app_1.default)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${auth_service_fixtures_1.existingUserToken}`)
            .send(Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction), { date: Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction.date), { year: 2025.2 }) }));
        expect(result.status).toBe(http_status_1.default.BAD_REQUEST);
        expect(result.body.message).toEqual(expect.stringContaining('"date.year" must be an integer'));
    }));
    //type
    it('Should return status BAD_REQUEST and error message - "type" is required (type is missing)', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, auth_service_fixtures_1.setUsersInDB)([
            Object.assign(Object.assign({}, auth_service_fixtures_1.existingUser), { token: auth_service_fixtures_1.existingUserToken })
        ]);
        const result = yield (0, supertest_1.default)(app_1.default)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${auth_service_fixtures_1.existingUserToken}`)
            .send(Object.assign({}, (0, lodash_1.omit)(transactions_fixtures_1.defaultExpenceTransaction, 'type')));
        expect(result.status).toBe(http_status_1.default.BAD_REQUEST);
        expect(result.body.message).toEqual(expect.stringContaining('"type" is required'));
    }));
    it('Should return status BAD_REQUEST and error message - must be one of [income, expense] (type is not a string)', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, auth_service_fixtures_1.setUsersInDB)([
            Object.assign(Object.assign({}, auth_service_fixtures_1.existingUser), { token: auth_service_fixtures_1.existingUserToken })
        ]);
        const result = yield (0, supertest_1.default)(app_1.default)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${auth_service_fixtures_1.existingUserToken}`)
            .send(Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction), { type: 12 }));
        expect(result.status).toBe(http_status_1.default.BAD_REQUEST);
        expect(result.body.message).toEqual(expect.stringContaining('"type" must be one of [income, expense]'));
    }));
    it('Should return status BAD_REQUEST and error message - must be one of [income, expense] (type is not assignable string)', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, auth_service_fixtures_1.setUsersInDB)([
            Object.assign(Object.assign({}, auth_service_fixtures_1.existingUser), { token: auth_service_fixtures_1.existingUserToken })
        ]);
        const result = yield (0, supertest_1.default)(app_1.default)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${auth_service_fixtures_1.existingUserToken}`)
            .send(Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction), { type: 'qwerty' }));
        expect(result.status).toBe(http_status_1.default.BAD_REQUEST);
        expect(result.body.message).toEqual(expect.stringContaining('"type" must be one of [income, expense]'));
    }));
    //category
    it('Should return status BAD_REQUEST and error message - "category" is required (category is missing)', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, auth_service_fixtures_1.setUsersInDB)([
            Object.assign(Object.assign({}, auth_service_fixtures_1.existingUser), { token: auth_service_fixtures_1.existingUserToken })
        ]);
        const result = yield (0, supertest_1.default)(app_1.default)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${auth_service_fixtures_1.existingUserToken}`)
            .send(Object.assign({}, (0, lodash_1.omit)(transactions_fixtures_1.defaultExpenceTransaction, 'category')));
        expect(result.status).toBe(http_status_1.default.BAD_REQUEST);
        expect(result.body.message).toEqual(expect.stringContaining('"category" is required'));
    }));
    it('Should return status BAD_REQUEST and error message - "category" must be one of ... (category is not a string)', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, auth_service_fixtures_1.setUsersInDB)([
            Object.assign(Object.assign({}, auth_service_fixtures_1.existingUser), { token: auth_service_fixtures_1.existingUserToken })
        ]);
        const result = yield (0, supertest_1.default)(app_1.default)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${auth_service_fixtures_1.existingUserToken}`)
            .send(Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction), { category: 12 }));
        expect(result.status).toBe(http_status_1.default.BAD_REQUEST);
        expect(result.body.message).toEqual(expect.stringContaining('"category" must be one of [main, house, children, development, food, basic, products, car, health, child care, household, education, leisure, other, salary]'));
    }));
    it('Should return status BAD_REQUEST and error message - "category" must be one of ... (category is not assignable string)', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, auth_service_fixtures_1.setUsersInDB)([
            Object.assign(Object.assign({}, auth_service_fixtures_1.existingUser), { token: auth_service_fixtures_1.existingUserToken })
        ]);
        const result = yield (0, supertest_1.default)(app_1.default)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${auth_service_fixtures_1.existingUserToken}`)
            .send(Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction), { category: 'qwerty' }));
        expect(result.status).toBe(http_status_1.default.BAD_REQUEST);
        expect(result.body.message).toEqual(expect.stringContaining('"category" must be one of [main, house, children, development, food, basic, products, car, health, child care, household, education, leisure, other, salary]'));
    }));
    //comment
    it('Should return status CREATED, and data with comment to equal empty string (comment is missing)', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, auth_service_fixtures_1.setUsersInDB)([
            Object.assign(Object.assign({}, auth_service_fixtures_1.existingUser), { token: auth_service_fixtures_1.existingUserToken })
        ]);
        const result = yield (0, supertest_1.default)(app_1.default)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${auth_service_fixtures_1.existingUserToken}`)
            .send(Object.assign({}, (0, lodash_1.omit)(transactions_fixtures_1.defaultExpenceTransaction, 'comment')));
        expect(result.status).toBe(http_status_1.default.CREATED);
        expect(result.body).toEqual(expect.objectContaining({
            comment: ''
        }));
    }));
    it('Should return status BAD_REQUEST and error message - "comment" must be a string (comment is not a string)', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, auth_service_fixtures_1.setUsersInDB)([
            Object.assign(Object.assign({}, auth_service_fixtures_1.existingUser), { token: auth_service_fixtures_1.existingUserToken })
        ]);
        const result = yield (0, supertest_1.default)(app_1.default)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${auth_service_fixtures_1.existingUserToken}`)
            .send(Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction), { comment: false }));
        expect(result.status).toBe(http_status_1.default.BAD_REQUEST);
        expect(result.body.message).toEqual(expect.stringContaining('"comment" must be a string'));
    }));
    //summ
    it('Should return status BAD_REQUEST and error message - "sum" is required (sum is missing)', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, auth_service_fixtures_1.setUsersInDB)([
            Object.assign(Object.assign({}, auth_service_fixtures_1.existingUser), { token: auth_service_fixtures_1.existingUserToken })
        ]);
        const result = yield (0, supertest_1.default)(app_1.default)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${auth_service_fixtures_1.existingUserToken}`)
            .send(Object.assign({}, (0, lodash_1.omit)(transactions_fixtures_1.defaultExpenceTransaction, 'sum')));
        expect(result.status).toBe(http_status_1.default.BAD_REQUEST);
        expect(result.body.message).toEqual(expect.stringContaining('"sum" is required'));
    }));
    it('Should return status BAD_REQUEST and error message - "sum" must be a number (sum is not a number)', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, auth_service_fixtures_1.setUsersInDB)([
            Object.assign(Object.assign({}, auth_service_fixtures_1.existingUser), { token: auth_service_fixtures_1.existingUserToken })
        ]);
        const result = yield (0, supertest_1.default)(app_1.default)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${auth_service_fixtures_1.existingUserToken}`)
            .send(Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction), { sum: 'qwerty' }));
        expect(result.status).toBe(http_status_1.default.BAD_REQUEST);
        expect(result.body.message).toEqual(expect.stringContaining('"sum" must be a number'));
    }));
    it('Should return status BAD_REQUEST and error message - "sum" must be greater than or equal to 0 (sum is less then own minimum)', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, auth_service_fixtures_1.setUsersInDB)([
            Object.assign(Object.assign({}, auth_service_fixtures_1.existingUser), { token: auth_service_fixtures_1.existingUserToken })
        ]);
        const result = yield (0, supertest_1.default)(app_1.default)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${auth_service_fixtures_1.existingUserToken}`)
            .send(Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction), { sum: -12.123 }));
        expect(result.status).toBe(http_status_1.default.BAD_REQUEST);
        expect(result.body.message).toEqual(expect.stringContaining('"sum" must be greater than or equal to 0'));
    }));
    it('Should return status CREATED and object with property sum and its value must have 2 decimal characters)', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, auth_service_fixtures_1.setUsersInDB)([
            Object.assign(Object.assign({}, auth_service_fixtures_1.existingUser), { token: auth_service_fixtures_1.existingUserToken })
        ]);
        expect.assertions(3);
        const addTransactions = jest.spyOn(transactions_controller_1.TransactionController, '_addTransactions');
        const result = yield (0, supertest_1.default)(app_1.default)
            .post('/api/wallet-api/transactions')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${auth_service_fixtures_1.existingUserToken}`)
            .send(Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction), { sum: 12.123121212 }));
        expect(addTransactions).toBeCalled();
        expect(result.status).toBe(http_status_1.default.CREATED);
        expect(result.body).toEqual(expect.objectContaining({
            sum: 12.12
        }));
    }));
});
describe('GET:/api/wallet-api/transactions/', () => {
    it('Should return all transactions (filter is default)', () => __awaiter(void 0, void 0, void 0, function* () {
        yield Promise.all([
            (0, auth_service_fixtures_1.setExistingUser)(),
            (0, transactions_fixtures_1.setDefaultTransactions)()
        ]);
        expect.assertions(4);
        (0, mockAuth_1.mockReqAndNext)({
            name: auth_service_fixtures_1.existingUser.name,
            email: auth_service_fixtures_1.existingUser.email,
            id: auth_service_fixtures_1.existingUserObjectId
        });
        const result = yield (0, supertest_1.default)(app_1.default)
            .get('/api/wallet-api/transactions');
        expect(result.status).toBe(http_status_1.default.OK);
        expect(result.body.length).toBe(2);
        expect(result.body).toEqual(expect.arrayContaining([
            expect.objectContaining(Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction), { id: transactions_fixtures_1.defaultExpenceTransactionId.toHexString(), owner: {
                    name: auth_service_fixtures_1.existingUser.name,
                    email: auth_service_fixtures_1.existingUser.email,
                } }))
        ]));
        expect(result.body).toEqual(expect.arrayContaining([
            expect.objectContaining(Object.assign(Object.assign({}, transactions_fixtures_1.defaultIncomeTransaction), { id: transactions_fixtures_1.defaultIncomeTransactionId.toHexString(), owner: {
                    name: auth_service_fixtures_1.existingUser.name,
                    email: auth_service_fixtures_1.existingUser.email,
                } }))
        ]));
    }));
    it('Should return status OK and empty array, there is no one transaction in database (filter is default)', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, auth_service_fixtures_1.setExistingUser)();
        expect.assertions(2);
        (0, mockAuth_1.mockReqAndNext)({
            name: auth_service_fixtures_1.existingUser.name,
            email: auth_service_fixtures_1.existingUser.email,
            id: auth_service_fixtures_1.existingUserObjectId
        });
        const result = yield (0, supertest_1.default)(app_1.default)
            .get('/api/wallet-api/transactions');
        expect(result.status).toBe(http_status_1.default.OK);
        expect(result.body.length).toBe(0);
    }));
});
describe('DELETE:/api/wallet-api/transactions/', () => {
    it('Should return status NO_CONTENT', () => __awaiter(void 0, void 0, void 0, function* () {
        yield Promise.all([
            (0, auth_service_fixtures_1.setExistingUser)(),
            (0, transactions_fixtures_1.setDefaultTransactions)()
        ]);
        expect.assertions(2);
        const deleteService = jest.spyOn(transaction_service_1.TransactionsService, 'delete');
        (0, mockAuth_1.mockReqAndNext)({
            name: auth_service_fixtures_1.existingUser.name,
            email: auth_service_fixtures_1.existingUser.email,
            id: auth_service_fixtures_1.existingUserObjectId
        });
        const result = yield (0, supertest_1.default)(app_1.default)
            .delete(`/api/wallet-api/transactions/${transactions_fixtures_1.defaultExpenceTransactionId.toHexString()}`);
        expect(deleteService).toBeCalledWith(auth_service_fixtures_1.existingUserObjectId, transactions_fixtures_1.defaultExpenceTransactionId.toHexString());
        expect(result.status).toBe(http_status_1.default.NO_CONTENT);
    }));
    it('Should status NOT_FOUND, transaction with this id is not exist', () => __awaiter(void 0, void 0, void 0, function* () {
        yield Promise.all([
            (0, auth_service_fixtures_1.setExistingUser)(),
            (0, transactions_fixtures_1.setDefaultTransactions)()
        ]);
        expect.assertions(3);
        const deleteService = jest.spyOn(transaction_service_1.TransactionsService, 'delete');
        (0, mockAuth_1.mockReqAndNext)({
            name: auth_service_fixtures_1.existingUser.name,
            email: auth_service_fixtures_1.existingUser.email,
            id: auth_service_fixtures_1.existingUserObjectId
        });
        const invalidTransactionId = new bson_1.ObjectId().toHexString();
        const result = yield (0, supertest_1.default)(app_1.default)
            .delete(`/api/wallet-api/transactions/${invalidTransactionId}`);
        expect(deleteService).toBeCalledWith(auth_service_fixtures_1.existingUserObjectId, invalidTransactionId);
        expect(result.status).toBe(http_status_1.default.NOT_FOUND);
        expect(result.body).toEqual(expect.objectContaining({
            message: node_util_1.default.format(errors_1.errorMessages.TRANSACTIONS.TRANSACTION_NOT_FOUND, invalidTransactionId)
        }));
    }));
    it('Should status INTERNAL_SERVER_ERROR, something wrong at database process', () => __awaiter(void 0, void 0, void 0, function* () {
        yield Promise.all([
            (0, auth_service_fixtures_1.setExistingUser)(),
            (0, transactions_fixtures_1.setDefaultTransactions)()
        ]);
        expect.assertions(3);
        jest.spyOn(transaction_1.Transaction, 'findByIdAndRemove').mockResolvedValue(false);
        const deleteService = jest.spyOn(transaction_service_1.TransactionsService, 'delete');
        (0, mockAuth_1.mockReqAndNext)({
            name: auth_service_fixtures_1.existingUser.name,
            email: auth_service_fixtures_1.existingUser.email,
            id: auth_service_fixtures_1.existingUserObjectId
        });
        const result = yield (0, supertest_1.default)(app_1.default)
            .delete(`/api/wallet-api/transactions/${transactions_fixtures_1.defaultExpenceTransactionId.toHexString()}`);
        expect(deleteService).toBeCalledWith(auth_service_fixtures_1.existingUserObjectId, transactions_fixtures_1.defaultExpenceTransactionId.toHexString());
        expect(result.status).toBe(http_status_1.default.INTERNAL_SERVER_ERROR);
        expect(result.body).toEqual(expect.objectContaining({
            message: errors_1.errorMessages.GENERAL.DATABASE_PROCESS_WAS_FAILED
        }));
    }));
});
describe('GET:/api/wallet-api/transactions/categories', () => {
    it('Should return all users transactions by category, filter params are default', () => __awaiter(void 0, void 0, void 0, function* () {
        yield Promise.all([
            (0, auth_service_fixtures_1.setExistingUser)(),
            (0, transactions_fixtures_1.setDefaultTransactions)()
        ]);
        expect.assertions(3);
        (0, mockAuth_1.mockReqAndNext)({
            name: auth_service_fixtures_1.existingUser.name,
            email: auth_service_fixtures_1.existingUser.email,
            id: auth_service_fixtures_1.existingUserObjectId
        });
        const categoryService = jest.spyOn(transaction_service_1.TransactionsService, 'getStatisticCategory');
        const result = yield (0, supertest_1.default)(app_1.default)
            .get('/api/wallet-api/transactions/categories');
        expect(result.status).toBe(http_status_1.default.OK);
        expect(result.body).toEqual(expect.objectContaining({
            expense: [{
                    total: 400,
                    categoryType: 'food'
                }],
            income: {
                total: 100
            }
        }));
        expect(categoryService).toBeCalledWith(auth_service_fixtures_1.existingUserObjectId, {
            month: 'all',
            year: 'all'
        });
    }));
    it('Should return status OK and data found by filter params (month: 9, year - default )', () => __awaiter(void 0, void 0, void 0, function* () {
        yield Promise.all([
            (0, auth_service_fixtures_1.setExistingUser)(),
            (0, transactions_fixtures_1.setDefaultTransactions)(),
            (0, transactions_fixtures_1.setTransactionsInDB)([
                Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction), { id: new bson_1.ObjectId(), owner: auth_service_fixtures_1.existingUserObjectId, date: Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction.date), { month: 10 }) })
            ]),
        ]);
        expect.assertions(4);
        (0, mockAuth_1.mockReqAndNext)({
            name: auth_service_fixtures_1.existingUser.name,
            email: auth_service_fixtures_1.existingUser.email,
            id: auth_service_fixtures_1.existingUserObjectId
        });
        const getStatisticCategory = jest.spyOn(transaction_service_1.TransactionsService, 'getStatisticCategory');
        const result = yield (0, supertest_1.default)(app_1.default)
            .get('/api/wallet-api/transactions/categories?month=9');
        expect(result.status).toBe(http_status_1.default.OK);
        expect(result.body).toEqual(expect.objectContaining({
            expense: [{
                    total: 400,
                    categoryType: 'food'
                }],
        }));
        expect(result.body.expense.length).toBe(1);
        expect(getStatisticCategory).toBeCalledWith(auth_service_fixtures_1.existingUserObjectId, {
            month: 9,
            year: 'all'
        });
    }));
    it('Should return status OK and data found by filter params (month: all, year - 2022 )', () => __awaiter(void 0, void 0, void 0, function* () {
        yield Promise.all([
            (0, auth_service_fixtures_1.setExistingUser)(),
            (0, transactions_fixtures_1.setDefaultTransactions)(),
            (0, transactions_fixtures_1.setTransactionsInDB)([
                Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction), { id: new bson_1.ObjectId(), owner: auth_service_fixtures_1.existingUserObjectId, date: Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction.date), { year: 2023 }) })
            ]),
        ]);
        expect.assertions(4);
        (0, mockAuth_1.mockReqAndNext)({
            name: auth_service_fixtures_1.existingUser.name,
            email: auth_service_fixtures_1.existingUser.email,
            id: auth_service_fixtures_1.existingUserObjectId
        });
        const getStatisticCategory = jest.spyOn(transaction_service_1.TransactionsService, 'getStatisticCategory');
        const result = yield (0, supertest_1.default)(app_1.default)
            .get('/api/wallet-api/transactions/categories?year=2022');
        expect(result.status).toBe(http_status_1.default.OK);
        expect(result.body).toEqual(expect.objectContaining({
            expense: [{
                    total: 400,
                    categoryType: 'food'
                }],
        }));
        expect(result.body.expense.length).toBe(1);
        expect(getStatisticCategory).toBeCalledWith(auth_service_fixtures_1.existingUserObjectId, {
            month: 'all',
            year: 2022
        });
    }));
    it('Should return status OK and data found by filter params (month: 9, year - 2022 )', () => __awaiter(void 0, void 0, void 0, function* () {
        yield Promise.all([
            (0, auth_service_fixtures_1.setExistingUser)(),
            (0, transactions_fixtures_1.setDefaultTransactions)(),
            (0, transactions_fixtures_1.setTransactionsInDB)([
                Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction), { id: new bson_1.ObjectId(), owner: auth_service_fixtures_1.existingUserObjectId, category: 'child care', date: Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction.date), { year: 2023 }) }),
                Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction), { id: new bson_1.ObjectId(), owner: auth_service_fixtures_1.existingUserObjectId, category: 'car', date: Object.assign(Object.assign({}, transactions_fixtures_1.defaultExpenceTransaction.date), { month: 10 }) })
            ]),
        ]);
        expect.assertions(4);
        (0, mockAuth_1.mockReqAndNext)({
            name: auth_service_fixtures_1.existingUser.name,
            email: auth_service_fixtures_1.existingUser.email,
            id: auth_service_fixtures_1.existingUserObjectId
        });
        const getStatisticCategory = jest.spyOn(transaction_service_1.TransactionsService, 'getStatisticCategory');
        const result = yield (0, supertest_1.default)(app_1.default)
            .get('/api/wallet-api/transactions/categories?month=9&year=2022');
        expect(result.status).toBe(http_status_1.default.OK);
        expect(result.body).toEqual(expect.objectContaining({
            expense: [{
                    total: 400,
                    categoryType: 'food'
                }],
        }));
        expect(result.body.expense.length).toBe(1);
        expect(getStatisticCategory).toBeCalledWith(auth_service_fixtures_1.existingUserObjectId, {
            month: 9,
            year: 2022
        });
    }));
});
