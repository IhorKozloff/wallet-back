"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const drago_reviewer_controller_1 = __importDefault(require("../controllers/drago-reviewer.controller"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const router = express_1.default.Router();
router.get('/get', (0, express_async_handler_1.default)(drago_reviewer_controller_1.default.getUserData));
router.post('/add', (0, express_async_handler_1.default)(drago_reviewer_controller_1.default.addUserData));
exports.default = router;
