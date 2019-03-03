import moment = require('moment');

const units = [
   [ 'millisecond', 'milliseconds', 'ms' ],
   [ 'second', 'seconds', 's' ],
   [ 'minute', 'minutes', 'm' ],
   [ 'hour', 'hours', 'h' ],
   [ 'day', 'days', 'd' ],
   [ 'week', 'weeks', 'w' ],
   [ 'month', 'months', 'M' ],
   [ 'year', 'years', 'y' ],
];

export default function roundMomentToInterval(
   date: string | moment.Moment,
   precision: number,
   unit: moment.unitOfTime.Base
): moment.Moment {
   date = moment(date);

   for (const unitLabels of units) {
      if (unitLabels.indexOf(unit) !== -1) {
         break;
      }
      date.set(unitLabels[0] as moment.unitOfTime.Base, 0);
   }

   date.set(unit, Math.floor(date.get(unit) / precision) * precision);

   return date;
}
