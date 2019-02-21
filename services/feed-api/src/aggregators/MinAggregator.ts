import _ from 'underscore';
import Aggregator from './Aggregator';

export default class MinAggregator extends Aggregator {

   public static readonly type: string = 'min';

   public calculateMovingMetric(previousMetric: MovingMetricObject | undefined, newValue: number): MovingMetricObject {
      return {
         value: Math.min(previousMetric && previousMetric.value || Infinity, newValue),
      };
   }

   protected _aggregateGroupOfEvents(groupOfEvents: FeedEvent[]): number {
      return _.chain(groupOfEvents).pluck('value').min().value();
   }

}
