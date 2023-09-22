"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const transaction_1 = require("../types/entities/transaction");
const add = joi_1.default.object({
    date: joi_1.default.object({
        day: joi_1.default.number().min(1).max(31).integer().required(),
        month: joi_1.default.number().min(1).max(12).integer().required(),
        year: joi_1.default.number().min(1970).max(9999).integer().required()
    }).required(),
    type: joi_1.default.string().valid(...transaction_1.KnownTransactionTypes).required(),
    category: joi_1.default.string().valid(...transaction_1.KnownTransactionCategories).required(),
    comment: joi_1.default.string().optional().default(''),
    sum: joi_1.default.number().min(0).precision(2).required(),
});
const statistic = joi_1.default.object({
    // month: Joi.string().valid(...KnownMonths).optional().default('all'),
    // year: Joi.number().min(1970).integer().optional().default('all')
    month: joi_1.default.alternatives().try(joi_1.default.number().integer().positive().min(1).max(12), joi_1.default.string().valid('all')).optional().default('all'),
    year: joi_1.default.alternatives().try(joi_1.default.number().integer().positive().min(1970).max(9999), joi_1.default.string().valid('all')).optional().default('all')
});
exports.default = {
    add,
    statistic
};
