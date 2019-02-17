import Aggregator from '../../src/aggregators/Aggregator';
import { expect } from 'chai';

class TestAggregator extends Aggregator {

   public _groupEventsBySpan(events: FeedEvent[], span: string): { [timestamp: string]: FeedEvent[] } {
      return super._groupEventsBySpan(events, span);
   }

   public _parseSpan(span: string): { amount: number; unit: 'm' | 'd' | 'h' } {
      return super._parseSpan(span);
   }

   protected _aggregateGroupOfEvents(): number {
      return NaN;
   }

}

describe('BaseAggregator', () => {

   describe('_groupEventsBySpan', () => {
      const agg = new TestAggregator();

      const inputEvents = [
         { timestamp: '2019-01-01T12:00:00.000Z', value: 5 },
         { timestamp: '2019-01-01T12:01:00.000Z', value: 6 },
         { timestamp: '2019-01-01T12:01:40.000Z', value: 8 },
         { timestamp: '2019-01-01T12:02:05.000Z', value: 0 },
         { timestamp: '2019-01-01T12:02:09.000Z', value: 12 },
         { timestamp: '2019-01-01T12:16:05.000Z', value: 12 },
         { timestamp: '2019-01-01T12:45:00.000Z', value: 2 },
         { timestamp: '2019-01-01T13:03:05.000Z', value: 3 },
      ];

      it('correctly groups a minute based span', () => {
         expect(agg._groupEventsBySpan(inputEvents, '1m')).to.eql({
            '2019-01-01T12:00:00.000Z': [
               { timestamp: '2019-01-01T12:00:00.000Z', value: 5 },
            ],
            '2019-01-01T12:01:00.000Z': [
               { timestamp: '2019-01-01T12:01:00.000Z', value: 6 },
               { timestamp: '2019-01-01T12:01:40.000Z', value: 8 },
            ],
            '2019-01-01T12:02:00.000Z': [
               { timestamp: '2019-01-01T12:02:05.000Z', value: 0 },
               { timestamp: '2019-01-01T12:02:09.000Z', value: 12 },
            ],
            '2019-01-01T12:16:00.000Z': [
               { timestamp: '2019-01-01T12:16:05.000Z', value: 12 },
            ],
            '2019-01-01T12:45:00.000Z': [
               { timestamp: '2019-01-01T12:45:00.000Z', value: 2 },
            ],
            '2019-01-01T13:03:00.000Z': [
               { timestamp: '2019-01-01T13:03:05.000Z', value: 3 },
            ],
         });
      });

      it('correctly groups a 15min based span', () => {
         expect(agg._groupEventsBySpan(inputEvents, '15m')).to.eql({
            '2019-01-01T12:00:00.000Z': [
               { timestamp: '2019-01-01T12:00:00.000Z', value: 5 },
               { timestamp: '2019-01-01T12:01:00.000Z', value: 6 },
               { timestamp: '2019-01-01T12:01:40.000Z', value: 8 },
               { timestamp: '2019-01-01T12:02:05.000Z', value: 0 },
               { timestamp: '2019-01-01T12:02:09.000Z', value: 12 },
            ],
            '2019-01-01T12:15:00.000Z': [
               { timestamp: '2019-01-01T12:16:05.000Z', value: 12 },
            ],
            '2019-01-01T12:45:00.000Z': [
               { timestamp: '2019-01-01T12:45:00.000Z', value: 2 },
            ],
            '2019-01-01T13:00:00.000Z': [
               { timestamp: '2019-01-01T13:03:05.000Z', value: 3 },
            ],
         });
      });

      it('correctly groups an hour based span', () => {
         expect(agg._groupEventsBySpan(inputEvents, '1h')).to.eql({
            '2019-01-01T12:00:00.000Z': [
               { timestamp: '2019-01-01T12:00:00.000Z', value: 5 },
               { timestamp: '2019-01-01T12:01:00.000Z', value: 6 },
               { timestamp: '2019-01-01T12:01:40.000Z', value: 8 },
               { timestamp: '2019-01-01T12:02:05.000Z', value: 0 },
               { timestamp: '2019-01-01T12:02:09.000Z', value: 12 },
               { timestamp: '2019-01-01T12:16:05.000Z', value: 12 },
               { timestamp: '2019-01-01T12:45:00.000Z', value: 2 },
            ],
            '2019-01-01T13:00:00.000Z': [
               { timestamp: '2019-01-01T13:03:05.000Z', value: 3 },
            ],
         });
      });

      it('correctly parses a day based span', () => {
         expect(agg._groupEventsBySpan(inputEvents, '1d')).to.eql({
            '2019-01-01T00:00:00.000Z': [
               { timestamp: '2019-01-01T12:00:00.000Z', value: 5 },
               { timestamp: '2019-01-01T12:01:00.000Z', value: 6 },
               { timestamp: '2019-01-01T12:01:40.000Z', value: 8 },
               { timestamp: '2019-01-01T12:02:05.000Z', value: 0 },
               { timestamp: '2019-01-01T12:02:09.000Z', value: 12 },
               { timestamp: '2019-01-01T12:16:05.000Z', value: 12 },
               { timestamp: '2019-01-01T12:45:00.000Z', value: 2 },
               { timestamp: '2019-01-01T13:03:05.000Z', value: 3 },
            ],
         });
      });
   });

   describe('_parseSpan', () => {
      const agg = new TestAggregator();

      it('correctly parses a minute based span', () => {
         expect(agg._parseSpan('5m')).to.eql({ amount: 5, unit: 'm' });
      });

      it('correctly parses an hour based span', () => {
         expect(agg._parseSpan('1h')).to.eql({ amount: 1, unit: 'h' });
      });

      it('correctly parses a day based span', () => {
         expect(agg._parseSpan('7d')).to.eql({ amount: 7, unit: 'd' });
      });

      it('throws an error on unparsable span', () => {
         expect(agg._parseSpan.bind(agg, 'bad-span')).to.throw(Error);
      });

   });

});
