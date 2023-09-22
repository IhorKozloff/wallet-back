import Joi from 'joi';
const emailRegexp = /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/;

const joiDragonUserDataSchema = Joi.object({
    email: Joi.string().pattern(emailRegexp),
    favoritesIds: Joi.array().items(Joi.string()).optional().default([]),
    avatar: Joi.string().not().empty().optional()
});