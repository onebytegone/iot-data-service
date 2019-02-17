import _ from 'underscore';
import moment from 'moment';
import roundMomentToInterval from '../lib/roundMomentToInterval';

export default abstract class Aggregator {

   public static readonly type: string;

   public aggregateEvents(events: FeedEvent[], span: string): FeedAggregationResponseEvent[] {
      const groupedEvents = this._groupEventsBySpan(events, span);

      return _.chain(groupedEvents)
         .map((groupOfEvents, timestamp: string) => {
            return {
               timestamp: timestamp,
               value: this._aggregateGroupOfEvents(groupOfEvents),
            };
         })
         .sortBy('timestamp')
         .value();
   }

   protected abstract _aggregateGroupOfEvents(groupOfEvents: FeedEvent[]): number;

   protected _groupEventsBySpan(events: FeedEvent[], span: string): { [timestamp: string]: FeedEvent[] } {
      const parsedSpan = this._parseSpan(span);

      return _.groupBy(events, (event) => {
         const eventTime = moment(event.timestamp).utc(),
               timeBucket = roundMomentToInterval(eventTime, parsedSpan.amount, parsedSpan.unit);

         return timeBucket.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
      });
   }

   protected _parseSpan(span: string): { amount: number; unit: 'm' | 'h' | 'd' } {
      const spanMatches = span.match(/(\d+)([mhd])/i);

      if (!spanMatches) {
         throw new Error(`Cannot parse span "${span}"`);
      }

      return {
         amount: parseInt(spanMatches[1], 10),
         unit: spanMatches[2].toLowerCase() as ('m' | 'h' | 'd'),
      };
   }

}
