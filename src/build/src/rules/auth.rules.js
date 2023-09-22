"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const emailRegexp = /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/;
const register = joi_1.default.object({
    name: joi_1.default.string().optional(),
    email: joi_1.default.string().pattern(emailRegexp).required(),
    password: joi_1.default.string().min(6).max(16).required()
});
const login = joi_1.default.object({
    email: joi_1.default.string().pattern(emailRegexp).required(),
    password: joi_1.default.string().min(6).max(16).required()
});
exports.default = {
    register,
    login,
};
