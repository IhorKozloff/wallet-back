"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validateParams_1 = require("../middlewares/validateParams");
const auth_rules_1 = __importDefault(require("../rules/auth.rules"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const userRouter = express_1.default.Router();
userRouter.post('/register', (0, validateParams_1.validateParams)('body', auth_rules_1.default.register), (0, express_async_handler_1.default)(auth_controller_1.AuthController.register));
userRouter.post('/login', (0, validateParams_1.validateParams)('body', auth_rules_1.default.login), (0, express_async_handler_1.default)(auth_controller_1.AuthController.login));
userRouter.get('/logout', authMiddleware_1.AuthMiddlware.isUserAuthorized, (0, express_async_handler_1.default)(auth_controller_1.AuthController.logout));
exports.default = userRouter;
