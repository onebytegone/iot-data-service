import _ from 'underscore';
import Aggregator from './Aggregator';

export default class MinAggregator extends Aggregator {

   public static readonly type: string = 'min';

   protected _aggregateGroupOfEvents(groupOfEvents: FeedEvent[]): number {
      return _.chain(groupOfEvents).pluck('value').min().value();
   }

}
