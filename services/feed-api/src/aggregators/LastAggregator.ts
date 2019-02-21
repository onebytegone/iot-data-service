import _ from 'underscore';
import Aggregator from './Aggregator';

export default class LastAggregator extends Aggregator {

   public static readonly type: string = 'last';

   public calculateMovingMetric(_previousMetric: MovingMetricObject | undefined, newValue: number): MovingMetricObject {
      return {
         value: newValue,
      };
   }

   protected _aggregateGroupOfEvents(groupOfEvents: FeedEvent[]): number {
      const lastEvent = _.last(groupOfEvents);

      return lastEvent ? lastEvent.value : NaN;
   }

}
