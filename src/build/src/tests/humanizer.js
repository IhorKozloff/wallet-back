"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.humanize = void 0;
const humanize_duration_1 = __importDefault(require("humanize-duration"));
const defaultDaysHumanizer = humanize_duration_1.default.humanizer({
    delimiter: ', ',
    units: ['d'],
    maxDecimalPoints: 0,
});
const defaultHoursHumanizer = humanize_duration_1.default.humanizer({
    delimiter: ', ',
    units: ['h'],
    maxDecimalPoints: 0,
});
const defaultMinutesHumanizer = humanize_duration_1.default.humanizer({
    delimiter: ', ',
    units: ['m'],
    maxDecimalPoints: 0,
});
const defaultDaysAndHourHumanizer = humanize_duration_1.default.humanizer({
    delimiter: ', ',
    units: ['d', 'h'],
    maxDecimalPoints: 0,
});
const Format = {
    onlyDays: defaultDaysHumanizer,
    onlyHours: defaultHoursHumanizer,
    onlyMinutes: defaultMinutesHumanizer,
};
const humanize = (duration, prefix = 'Ended', settings = {}) => {
    // if (!duration) {
    //     return '';
    // } else if (duration < 0) {
    //     return settings.format ? `${prefix} in ${Format[settings.format](duration)}` : `${prefix} ${defaultDaysHumanizer(-duration)} ago`;
    // } else if (duration > 0) {
    // }
    if (settings.format) {
        console.log('Case in settings');
        return `${prefix} in ${Format[settings.format](duration)}`;
    }
    else {
        console.log('Case without settings');
        console.log(duration);
        return `${prefix} in ${defaultDaysAndHourHumanizer(duration)}`;
    }
};
exports.humanize = humanize;
