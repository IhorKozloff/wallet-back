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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DragonReviewerService = void 0;
const dragonReviewerUserData_1 = require("../models/dragonReviewerUserData");
class DragonReviewerService {
    static findUserDataByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const userData = yield dragonReviewerUserData_1.DragonReviewerUserData.findOne({ email });
            if (userData) {
                return {
                    email: userData.email,
                    favoritesIds: userData.favoritesIds,
                    avatar: userData.avatar
                };
            }
            else {
                return null;
            }
        });
    }
    static createUserData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield dragonReviewerUserData_1.DragonReviewerUserData.create(data);
            return result.sanitize();
        });
    }
    static updateUserDataByEmail(email, newData) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield dragonReviewerUserData_1.DragonReviewerUserData.findOneAndUpdate({ email: email }, newData, { new: true });
            return result ? result.sanitize() : null;
        });
    }
    static processUserData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = data, rest = __rest(data, ["email"]);
            const isUser = yield DragonReviewerService.findUserDataByEmail(email);
            if (isUser) {
                return yield DragonReviewerService.updateUserDataByEmail(email, rest);
            }
            else {
                return yield DragonReviewerService.createUserData(data);
            }
        });
    }
}
exports.DragonReviewerService = DragonReviewerService;
