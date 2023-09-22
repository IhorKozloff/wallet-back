import Joi from 'joi';
import { KnownTransactionTypes, KnownTransactionCategories } from '../types/entities/transaction';

const add = Joi.object({
    date: Joi.object({
        day: Joi.number().min(1).max(31).integer().required(),
        month: Joi.number().min(1).max(12).integer().required(),
        year: Joi.number().min(1970).max(9999).integer().required()
    }).required(),
    type: Joi.string().valid(...KnownTransactionTypes).required(),
    category: Joi.string().valid(...KnownTransactionCategories).required(),
    comment: Joi.string().optional().default(''),
    sum: Joi.number().min(0).precision(2).required(),
});

const statistic = Joi.object({
    // month: Joi.string().valid(...KnownMonths).optional().default('all'),
    // year: Joi.number().min(1970).integer().optional().default('all')
    month: Joi.alternatives().try(Joi.number().integer().positive().min(1).max(12), Joi.string().valid('all')).optional().default('all'),
    year: Joi.alternatives().try(Joi.number().integer().positive().min(1970).max(9999), Joi.string().valid('all')).optional().default('all')
});

export default {
    add,
    statistic
};