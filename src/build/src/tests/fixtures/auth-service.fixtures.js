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
exports.setExistingUser = exports.settings = exports.setUsersInDB = exports.existingUser = exports.existingUserToken = exports.existingUserObjectId = exports.existingUserAuthData = exports.defaultUser = exports.fakeData = void 0;
const bson_1 = require("bson");
const user_1 = require("../../models/user");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const lodash_1 = require("lodash");
const generateToken_1 = __importDefault(require("../../helpers/generateToken"));
const unexistingObjectId = new bson_1.ObjectId();
exports.fakeData = {
    invalid: {
        email: 'email.com',
        password: '123'
    },
    unexisting: {
        email: 'unexistingEmail@gmail.com',
        objectId: unexistingObjectId,
        id: unexistingObjectId.toHexString(),
        password: '11122121122'
    }
};
exports.defaultUser = {
    name: 'John',
    email: 'john@gmail.com',
    password: '1234567890'
};
exports.existingUserAuthData = Object.assign({}, (0, lodash_1.omit)(exports.defaultUser, ['name']));
exports.existingUserObjectId = new bson_1.ObjectId();
const existingUserId = exports.existingUserObjectId.toHexString();
const existingUserHashedPassword = bcryptjs_1.default.hashSync(exports.defaultUser.password, 10);
exports.existingUserToken = generateToken_1.default.generateById(existingUserId);
exports.existingUser = Object.assign(Object.assign({}, exports.defaultUser), { id: existingUserId, token: '', password: existingUserHashedPassword });
const setUsersInDB = (users) => __awaiter(void 0, void 0, void 0, function* () {
    const preparedData = users.map(item => {
        return Object.assign(Object.assign({}, (0, lodash_1.omit)(item, ['id'])), { _id: item.id });
    });
    return user_1.User.insertMany(preparedData);
});
exports.setUsersInDB = setUsersInDB;
exports.settings = {
    'new': true
};
const setExistingUser = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, exports.setUsersInDB)([
        exports.existingUser
    ]);
});
exports.setExistingUser = setExistingUser;
