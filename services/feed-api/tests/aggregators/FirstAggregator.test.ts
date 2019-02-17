import FirstAggregator from '../../src/aggregators/FirstAggregator';
import { expect } from 'chai';

describe('FirstAggregator', () => {
   const agg = new FirstAggregator();

   describe('aggregateEvents', () => {

      it('returns the first of the provided events', () => {
         const events: FeedEvent[] = [
            { timestamp: '2019-01-01T12:00:00.000Z', value: 5 },
            { timestamp: '2019-01-01T12:01:00.000Z', value: 8 },
            { timestamp: '2019-01-01T12:01:40.000Z', value: 6 },
            { timestamp: '2019-01-01T12:02:05.000Z', value: 0 },
            { timestamp: '2019-01-01T12:02:09.000Z', value: 12 },
            { timestamp: '2019-01-01T12:03:05.000Z', value: 12 },
         ];

         expect(agg.aggregateEvents(events, '1m')).to.eql([
            { timestamp: '2019-01-01T12:00:00.000Z', value: 5 },
            { timestamp: '2019-01-01T12:01:00.000Z', value: 8 },
            { timestamp: '2019-01-01T12:02:00.000Z', value: 0 },
            { timestamp: '2019-01-01T12:03:00.000Z', value: 12 },
         ] as FeedAggregationResponseEvent[]);
      });

   });

});
