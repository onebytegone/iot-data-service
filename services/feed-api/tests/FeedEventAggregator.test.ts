import FeedEventAggregator from '../src/FeedEventAggregator';
import { expect } from 'chai';
import sinon, { SinonStub } from 'sinon';
import FeedReader from '../src/FeedReader';
import TimeRange from '../src/model/TimeRange';

describe('FeedEventAggregator', () => {

   describe('aggregate', () => {

      it('returns the average of the provided events', () => {
         const feedReaderStub = sinon.createStubInstance(FeedReader) as any as FeedReader,
               feedEventAgg = new FeedEventAggregator(feedReaderStub),
               range = new TimeRange('2019-01-01T12:00:00.000Z', '2019-01-01T12:00:05.000Z');

         (feedReaderStub.read as SinonStub).returns(Promise.resolve([
            { timestamp: '2019-01-01T12:00:05.000Z', value: 5 },
            { timestamp: '2019-01-01T12:01:00.000Z', value: 6 },
            { timestamp: '2019-01-01T12:01:40.000Z', value: 8 },
            { timestamp: '2019-01-01T12:02:05.000Z', value: 0 },
            { timestamp: '2019-01-01T12:02:09.000Z', value: 12 },
            { timestamp: '2019-01-01T12:03:05.000Z', value: 12 },
         ]));

         return feedEventAgg.aggregate('testFeed', 'testFacet', range, '1m', 'avg')
            .then((results) => {
               expect(results).to.eql({
                  feed: 'testFeed',
                  facet: 'testFacet',
                  start: '2019-01-01T12:00:00.000Z',
                  end: '2019-01-01T12:03:00.000Z',
                  span: '1m',
                  aggregation: 'avg',
                  results: [
                     { timestamp: '2019-01-01T12:00:00.000Z', value: 5 },
                     { timestamp: '2019-01-01T12:01:00.000Z', value: 7 },
                     { timestamp: '2019-01-01T12:02:00.000Z', value: 6 },
                     { timestamp: '2019-01-01T12:03:00.000Z', value: 12 },
                  ],
               });
               sinon.assert.calledOnce(feedReaderStub.read as SinonStub);
               sinon.assert.calledWithExactly(feedReaderStub.read as SinonStub, 'testFeed', 'testFacet', range);
            });
      });

      it('throws an error when an invalid aggregator is requested', () => {
         const feedEventAgg = new FeedEventAggregator(),
               range = new TimeRange('2019-01-01T12:00:00.000Z', '2019-01-01T12:00:05.000Z');

         expect(() => feedEventAgg.aggregate('testFeed', 'testFacet', range, '1m', 'invalid-agg')).to.throw(Error);
      });

   });

});
