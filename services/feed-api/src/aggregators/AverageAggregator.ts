import _ from 'underscore';
import Aggregator from './Aggregator';

interface MovingAverageObject extends MovingMetricObject {
   count?: number;
}

export default class AverageAggregator extends Aggregator {

   public static readonly type: string = 'avg';

   public calculateMovingMetric(previousMetric: MovingAverageObject | undefined, newValue: number): MovingAverageObject {
      const oldValue = (previousMetric && previousMetric.value || 0),
            count = (previousMetric && previousMetric.count || 0) + 1;

      return {
         value: oldValue + ((newValue - oldValue) / count),
         count: count,
      };
   }

   protected _aggregateGroupOfEvents(groupOfEvents: FeedEvent[]): number {
      const sum = _.reduce(groupOfEvents, (memo, event) => memo + event.value, 0);

      return sum / groupOfEvents.length;
   }

}
