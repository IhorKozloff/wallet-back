"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const transactions_controller_1 = require("../controllers/transactions.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validateParams_1 = require("../middlewares/validateParams");
const transaction_rules_1 = __importDefault(require("../rules/transaction.rules"));
const router = express_1.default.Router();
router.get('/', authMiddleware_1.AuthMiddlware.isUserAuthorized, (0, express_async_handler_1.default)(transactions_controller_1.TransactionController.getAllTransactions));
router.get('/categories', authMiddleware_1.AuthMiddlware.isUserAuthorized, (0, validateParams_1.validateParams)('query', transaction_rules_1.default.statistic), (0, express_async_handler_1.default)(transactions_controller_1.TransactionController.getStatisticsCategories));
router.post('/', authMiddleware_1.AuthMiddlware.isUserAuthorized, (0, validateParams_1.validateParams)('body', transaction_rules_1.default.add), (0, express_async_handler_1.default)(transactions_controller_1.TransactionController.addTransactions));
router.delete('/:id', authMiddleware_1.AuthMiddlware.isUserAuthorized, (0, express_async_handler_1.default)(transactions_controller_1.TransactionController.deleteTransaction));
exports.default = router;
