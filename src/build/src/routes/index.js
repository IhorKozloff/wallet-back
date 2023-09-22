"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const transactionsRoutes_1 = __importDefault(require("./transactionsRoutes"));
const user_routes_1 = __importDefault(require("./user-routes"));
const dragon_reviewer_user_data_router_1 = __importDefault(require("./dragon-reviewer-user-data-router"));
const router = express_1.default.Router();
router.use('/wallet-api/transactions', transactionsRoutes_1.default);
router.use('/auth-api', user_routes_1.default);
router.use('/dragon-api/', dragon_reviewer_user_data_router_1.default);
exports.default = router;
