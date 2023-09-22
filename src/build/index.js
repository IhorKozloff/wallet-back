"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const mongoose_1 = __importDefault(require("mongoose"));
const { PORT = 3001, MONGO_URL } = process.env;
mongoose_1.default
    .connect(MONGO_URL)
    .then(() => app_1.default.listen(3001))
    .then(() => {
    console.log('Database connected');
    console.log(`Server run on port ${PORT}`);
})
    .catch(() => () => {
    console.log('Не запустилось ничего, ошибка какая-то');
    // console.log(error)
    // process.exit(1)
});
