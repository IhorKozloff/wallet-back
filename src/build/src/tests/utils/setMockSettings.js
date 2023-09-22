"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setMockSettings = void 0;
const setMockSettings = () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });
    afterAll(() => {
        jest.resetAllMocks();
    });
};
exports.setMockSettings = setMockSettings;
