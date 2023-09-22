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
exports.AuthService = void 0;
const user_1 = require("../models/user");
const AppError_1 = require("../types/AppError");
const generateToken_1 = __importDefault(require("../helpers/generateToken"));
const hashPassword_1 = __importDefault(require("../helpers/hashPassword"));
const errors_1 = require("../errors");
const lodash_1 = require("lodash");
class AuthService {
    static login(userLoginData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = userLoginData;
            const user = yield user_1.User.findOne({ email });
            if (!user) {
                throw new AppError_1.AppError(401, errors_1.errorMessages.AUTH.EMAIL_NOT_FOUND);
            }
            const isPasswordValid = yield hashPassword_1.default.validate(password, user.password);
            if (!isPasswordValid) {
                throw new AppError_1.AppError(401, errors_1.errorMessages.AUTH.WRONG_PASSWORD);
            }
            const userId = user._id.toHexString();
            const token = generateToken_1.default.generateById(userId);
            const updatedUser = yield user_1.User.findByIdAndUpdate(userId, { token }, { new: true });
            if (updatedUser === null) {
                throw new AppError_1.AppError(500, errors_1.errorMessages.GENERAL.DATABASE_PROCESS_WAS_FAILED);
            }
            const updatedUserSanitize = updatedUser.sanitize();
            return (0, lodash_1.omit)(updatedUserSanitize, ['password']);
        });
    }
    static register(userRegisterData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, password } = userRegisterData;
            const user = yield user_1.User.findOne({ email });
            if (user !== null) {
                throw new AppError_1.AppError(409, errors_1.errorMessages.AUTH.EMAIL_IN_USE);
            }
            const hashPassword = yield hashPassword_1.default.hash(password, 10);
            const creatingUserData = {
                email,
                password: hashPassword
            };
            if (name) {
                creatingUserData.name = name;
            }
            const createdUser = yield user_1.User.create(creatingUserData);
            const sanitazedCreatedResult = createdUser.sanitize();
            return Object.assign({}, (0, lodash_1.omit)(sanitazedCreatedResult, ['password']));
        });
    }
    static logout(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedUser = yield user_1.User.findByIdAndUpdate(userId, { token: '' }, { new: true });
            if (updatedUser === null) {
                throw new AppError_1.AppError(500, errors_1.errorMessages.GENERAL.DATABASE_PROCESS_WAS_FAILED);
            }
            const updatedUserSanitize = updatedUser.sanitize();
            return Object.assign({}, (0, lodash_1.omit)(updatedUserSanitize, ['password']));
        });
    }
}
exports.AuthService = AuthService;
