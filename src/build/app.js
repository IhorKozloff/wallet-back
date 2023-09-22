"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const AppError_1 = require("./src/types/AppError");
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./src/routes"));
const app = (0, express_1.default)();
const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use('/api', routes_1.default);
app.use((req, res) => {
    console.log('my server error', 'No Routes Matched');
    res.status(404).json({
        message: 'No Routes Matched'
    });
});
app.use((err, req, res, next) => {
    if (err instanceof AppError_1.AppError) {
        const { code = 500, message = 'Eyeshield Server Error' } = err;
        //console.log('Зара буде помилка з обробника помилок:', message, code);
        res.status(code).json({ message });
    }
    else {
        // console.log('А ось помилка з обробника помилок, але не типу AppError:');
        // console.log(err);
        const { message } = err;
        res.status(500).json({ message });
    }
});
exports.default = app;
