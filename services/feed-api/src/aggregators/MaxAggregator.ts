import _ from 'underscore';
import Aggregator from './Aggregator';

export default class MaxAggregator extends Aggregator {

   public static readonly type: string = 'max';

   protected _aggregateGroupOfEvents(groupOfEvents: FeedEvent[]): number {
      return _.chain(groupOfEvents).pluck('value').max().value();
   }

}
