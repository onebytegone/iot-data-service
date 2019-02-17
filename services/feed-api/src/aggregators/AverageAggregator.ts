import _ from 'underscore';
import Aggregator from './Aggregator';

export default class AverageAggregator extends Aggregator {

   public static readonly type: string = 'avg';

   protected _aggregateGroupOfEvents(groupOfEvents: FeedEvent[]): number {
      const sum = _.reduce(groupOfEvents, (memo, event) => memo + event.value, 0);

      return sum / groupOfEvents.length;
   }

}
