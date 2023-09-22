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
exports.setDatabaseConnection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = require("../../models/user");
const transaction_1 = require("../../models/transaction");
// export const setDatabaseConnection = () => {
//     beforeAll(async () => {
//         await mongoose.connect('mongodb+srv://eyeshield21:112212qw@cluster0.6nmjspu.mongodb.net/db-wallet-tests?retryWrites=true&w=majority');
//     });
//     beforeEach(async () => {
//         await Promise.all(
//           Object.values(mongoose.connection.collections).map(async (collection) => collection.deleteMany({})),
//         );
//         //это все равно что
//         //await users.deleteMany({})
//         //await transactions.deleteMany({})
//         //await dragonrevieweruserdatas.deleteMany({})
//     });
//     afterAll(async () => {
//         await mongoose.disconnect();
//     });
// }
const setDatabaseConnection = () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.connect('mongodb+srv://eyeshield21:112212qw@cluster0.6nmjspu.mongodb.net/db-wallet-tests?retryWrites=true&w=majority');
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield user_1.User.deleteMany();
        yield transaction_1.Transaction.deleteMany();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.disconnect();
    }));
};
exports.setDatabaseConnection = setDatabaseConnection;
