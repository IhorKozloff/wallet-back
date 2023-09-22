"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMessages = void 0;
exports.errorMessages = {
    AUTH: {
        EMAIL_IN_USE: 'Email in use!',
        EMAIL_NOT_FOUND: 'Email not found!',
        WRONG_PASSWORD: 'Wrong password!',
        NOT_AUTHORIZED: 'Error! No authorized!',
        AUTHORIZATION_HEADER_NOT_BEGIN_BEARER: 'Error! Authorization header does not start with Bearer!',
        TOKEN_IS_BAD: 'Token is bad :(',
        INVALID_AUTH_HEADER: 'Authorization header is not valid',
        USER_IS_NOT_FOUND: 'User is not found!',
    },
    TRANSACTIONS: {
        TRANSACTION_NOT_FOUND: 'Transaction by id %s not found.'
    },
    GENERAL: {
        DATABASE_PROCESS_WAS_FAILED: 'Data base process was failed!'
    },
};
