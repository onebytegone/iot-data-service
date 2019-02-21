import _ from 'underscore';
import Aggregator from './Aggregator';

export default class MaxAggregator extends Aggregator {

   public static readonly type: string = 'max';

   public calculateMovingMetric(previousMetric: MovingMetricObject | undefined, newValue: number): MovingMetricObject {
      return {
         value: Math.max(previousMetric && previousMetric.value || -Infinity, newValue),
      };
   }

   protected _aggregateGroupOfEvents(groupOfEvents: FeedEvent[]): number {
      return _.chain(groupOfEvents).pluck('value').max().value();
   }

}
