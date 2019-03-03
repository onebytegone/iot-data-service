import _ from 'underscore';
import Aggregator from './Aggregator';

export default class SumAggregator extends Aggregator {

   public static readonly type: string = 'sum';

   protected _aggregateGroupOfEvents(groupOfEvents: FeedEvent[]): number {
      return _.reduce(groupOfEvents, (memo, event) => memo + event.value, 0);
   }

}
