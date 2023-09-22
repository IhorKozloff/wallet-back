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
const dragon_reviewer_service_1 = require("../services/dragon-reviewer.service");
const http_status_1 = __importDefault(require("http-status"));
class DragonReviewerUserDataController {
    static addUserData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield dragon_reviewer_service_1.DragonReviewerService.processUserData(req.body);
            res.status(http_status_1.default.OK).json(result);
        });
    }
    static getUserData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = req.query;
            const result = yield dragon_reviewer_service_1.DragonReviewerService.findUserDataByEmail(email);
            res.status(http_status_1.default.OK).json(result);
        });
    }
}
exports.default = DragonReviewerUserDataController;
