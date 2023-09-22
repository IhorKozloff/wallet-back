"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const lodash_1 = require("lodash");
const emailRegexp = /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/;
const UserSchema = new mongoose_1.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        match: emailRegexp,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    token: {
        type: String,
        default: ''
    }
}, { timestamps: true });
UserSchema.method('sanitize', function (_model) {
    const userData = this.toJSON({ virtuals: true });
    return Object.assign({}, (0, lodash_1.omit)(userData, ['createdAt', 'updatedAt', '__v', '_id']));
});
exports.User = (0, mongoose_1.model)('user', UserSchema);
