"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const humanizer_1 = require("./humanizer");
const moment_1 = __importDefault(require("moment"));
describe('Test humanizer with setttings params', () => {
    it('', () => {
        const now = new Date('2023-09-06 14:00:00').getTime();
        const from = new Date('2023-09-15 14:00:00');
        const prefix = 'Promo starts';
        const duration = (0, moment_1.default)(from).diff(now, 'ms');
        console.log(from);
        const result = (0, humanizer_1.humanize)(duration, prefix, {
            format: 'onlyDays'
        });
        // console.log(`result ->> ${result} <<- result`);
        expect(result).toBe(`${prefix} in 9 days`);
    });
});
