"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DragonReviewerUserData = void 0;
const mongoose_1 = require("mongoose");
const lodash_1 = require("lodash");
const DragonReviewerSchema = new mongoose_1.Schema({
    email: {
        type: mongoose_1.Schema.Types.String,
        require: true
    },
    favoritesIds: {
        type: [mongoose_1.Schema.Types.String],
        default: []
    },
    avatar: {
        type: mongoose_1.Schema.Types.String
    }
}, { timestamps: true });
DragonReviewerSchema.index({
    'email': 1,
}, { background: true });
DragonReviewerSchema.method('sanitize', function (_model) {
    return (0, lodash_1.omit)(this.toJSON(), ['createdAt', '_id', '__v']);
});
exports.DragonReviewerUserData = (0, mongoose_1.model)('dragonReviewerUserData', DragonReviewerSchema);
