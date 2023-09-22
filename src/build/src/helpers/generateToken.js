"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const { SECRET_KEY } = process.env;
class Token {
    static generateById(payloadValue) {
        return jsonwebtoken_1.default.sign({ id: payloadValue }, `${SECRET_KEY}`, { expiresIn: '24h' });
    }
    static generateAny(payload) {
        return jsonwebtoken_1.default.sign(payload, `${SECRET_KEY}`, { expiresIn: '24h' });
    }
}
exports.default = Token;
