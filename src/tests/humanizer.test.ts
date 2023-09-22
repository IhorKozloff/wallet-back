import { humanize } from './humanizer';
import moment from 'moment';

describe('Test humanizer with setttings params', () => {

    it('', () => {

        const now = new Date('2023-09-06 14:00:00').getTime();
        const from = new Date('2023-09-15 14:00:00');
        const prefix = 'Promo starts';


        const duration = moment(from).diff(now, 'ms');

        console.log(from)

        const result = humanize(
            duration,
            prefix,
              {
                format: 'onlyDays'
              }
        );

        // console.log(`result ->> ${result} <<- result`);
        expect(result).toBe(`${prefix} in 9 days`);
    }); 
});