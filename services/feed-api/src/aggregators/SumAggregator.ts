import _ from 'underscore';
import Aggregator from './Aggregator';

export default class SumAggregator extends Aggregator {

   public static readonly type: string = 'sum';

   public calculateMovingMetric(previousMetric: MovingMetricObject | undefined, newValue: number): MovingMetricObject {
      return {
         value: (previousMetric && previousMetric.value || 0) + newValue,
      };
   }

   protected _aggregateGroupOfEvents(groupOfEvents: FeedEvent[]): number {
      return _.reduce(groupOfEvents, (memo, event) => memo + event.value, 0);
   }

}
