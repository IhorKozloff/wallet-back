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
exports.AuthMiddlware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../models/user");
const AppError_1 = require("../types/AppError");
const errors_1 = require("../errors");
const http_status_1 = __importDefault(require("http-status"));
const { SECRET_KEY } = process.env;
class AuthMiddlware {
    static _isUserAuthorized(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { authorization } = req.headers;
            if (authorization) {
                const [bearer, token] = authorization.split(' ');
                if (bearer !== 'Bearer') {
                    const newError = new AppError_1.AppError(http_status_1.default.UNAUTHORIZED, errors_1.errorMessages.AUTH.AUTHORIZATION_HEADER_NOT_BEGIN_BEARER);
                    return next(newError);
                }
                if (!token) {
                    const newError = new AppError_1.AppError(http_status_1.default.UNAUTHORIZED, errors_1.errorMessages.AUTH.TOKEN_IS_BAD);
                    return next(newError);
                }
                let userId;
                try {
                    const { id } = jsonwebtoken_1.default.verify(token, SECRET_KEY);
                    userId = id;
                }
                catch (err) {
                    const newError = new AppError_1.AppError(http_status_1.default.UNAUTHORIZED, errors_1.errorMessages.AUTH.TOKEN_IS_BAD);
                    return next(newError);
                }
                if (!userId) {
                    const newError = new AppError_1.AppError(http_status_1.default.UNAUTHORIZED, errors_1.errorMessages.AUTH.TOKEN_IS_BAD);
                    return next(newError);
                }
                const user = yield user_1.User.findById(userId);
                if (user) {
                    req.user = {
                        id: user._id,
                        name: user.name,
                        email: user.email
                    };
                    return next();
                }
                else {
                    const newError = new AppError_1.AppError(http_status_1.default.UNAUTHORIZED, errors_1.errorMessages.AUTH.NOT_AUTHORIZED);
                    return next(newError);
                }
            }
            else {
                const newError = new AppError_1.AppError(http_status_1.default.UNAUTHORIZED, errors_1.errorMessages.AUTH.INVALID_AUTH_HEADER);
                return next(newError);
            }
        });
    }
    static isUserAuthorized(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            return AuthMiddlware._isUserAuthorized(req, res, next);
        });
    }
}
exports.AuthMiddlware = AuthMiddlware;
