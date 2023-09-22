"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const emailRegexp = /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/;
const joiDragonUserDataSchema = joi_1.default.object({
    email: joi_1.default.string().pattern(emailRegexp),
    favoritesIds: joi_1.default.array().items(joi_1.default.string()).optional().default([]),
    avatar: joi_1.default.string().not().empty().optional()
});
