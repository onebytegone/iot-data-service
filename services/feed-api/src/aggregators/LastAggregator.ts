import _ from 'underscore';
import Aggregator from './Aggregator';

export default class LastAggregator extends Aggregator {

   public static readonly type: string = 'last';

   protected _aggregateGroupOfEvents(groupOfEvents: FeedEvent[]): number {
      const lastEvent = _.last(groupOfEvents);

      return lastEvent ? lastEvent.value : NaN;
   }

}
