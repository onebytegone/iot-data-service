import _ from 'underscore';
import Aggregator from './Aggregator';

export default class FirstAggregator extends Aggregator {

   public static readonly type: string = 'first';

   public calculateMovingMetric(previousMetric: MovingMetricObject | undefined, newValue: number): MovingMetricObject {
      if (previousMetric) {
         return previousMetric;
      }

      return {
         value: newValue,
      };
   }

   protected _aggregateGroupOfEvents(groupOfEvents: FeedEvent[]): number {
      const firstEvent = _.first(groupOfEvents);

      return firstEvent ? firstEvent.value : NaN;
   }

}
