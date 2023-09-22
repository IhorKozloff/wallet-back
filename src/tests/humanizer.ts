import humanizeDuration from 'humanize-duration';

const defaultDaysHumanizer = humanizeDuration.humanizer({
    delimiter: ', ',
    units: ['d'],
    maxDecimalPoints: 0,
});
const defaultHoursHumanizer = humanizeDuration.humanizer({
    delimiter: ', ',
    units: ['h'],
    maxDecimalPoints: 0,
});
const defaultMinutesHumanizer = humanizeDuration.humanizer({
    delimiter: ', ',
    units: ['m'],
    maxDecimalPoints: 0,
});

const defaultDaysAndHourHumanizer = humanizeDuration.humanizer({
    delimiter: ', ',
    units: ['d', 'h'],
    maxDecimalPoints: 0,
});

const Format = {
    onlyDays: defaultDaysHumanizer,
    onlyHours: defaultHoursHumanizer,
    onlyMinutes: defaultMinutesHumanizer,
};

interface ISettings {
  format?: 'onlyDays' | 'onlyHours' | 'onlyMinutes'
}

export const humanize = (duration: number | undefined, prefix = 'Ended', settings: ISettings = {}): string => {
    // if (!duration) {
    //     return '';
    // } else if (duration < 0) {
    //     return settings.format ? `${prefix} in ${Format[settings.format](duration)}` : `${prefix} ${defaultDaysHumanizer(-duration)} ago`;
    // } else if (duration > 0) {
        
    // }
    if (settings.format) {
        console.log('Case in settings')
        return `${prefix} in ${Format[settings.format](duration!)}`
    } else {
        console.log('Case without settings')
        console.log(duration)
        return `${prefix} in ${defaultDaysAndHourHumanizer(duration!)}`
    }

};