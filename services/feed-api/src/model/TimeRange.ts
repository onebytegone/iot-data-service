import moment from 'moment';

export default class TimeRange {

   private _start: moment.Moment;
   private _end: moment.Moment;

   public constructor(start: string, end?: string) {
      this._end = moment(end).utc();
      this._start = this._calculateStartTime(start, this._end);
   }

   public getStartAsISO8061(): string {
      return this._start.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
   }

   public getEndAsISO8061(): string {
      return this._end.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
   }

   private _calculateStartTime(start: string, end: moment.Moment): moment.Moment {
      const relativeTimeMatches = start.match(/-(\d+)([mhd])/i);

      if (relativeTimeMatches) {
         const amount = parseInt(relativeTimeMatches[1], 10),
               unit = relativeTimeMatches[2].toLowerCase() as ('m' | 'h' | 'd');

         return end.clone().subtract(amount, unit);
      }

      return moment(start).utc();
   }

}
