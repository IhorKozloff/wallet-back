import Joi from 'joi';

const emailRegexp = /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/;

const register = Joi.object({
    name: Joi.string().optional(),
    email: Joi.string().pattern(emailRegexp).required(),
    password: Joi.string().min(6).max(16).required()
});

const login = Joi.object({
    email: Joi.string().pattern(emailRegexp).required(),
    password: Joi.string().min(6).max(16).required()
});

export default {
    register,
    login,
}