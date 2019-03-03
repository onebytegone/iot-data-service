import FeedReader from '../src/FeedReader';
import { expect } from 'chai';
import AWS from 'aws-sdk-mock';
import { DynamoDB } from 'aws-sdk';
import TimeRange from '../src/model/TimeRange';
import sinon from 'sinon';

class TestFeedReader extends FeedReader {

   public _getEntries(feed: string, facet: string, start: string, end: string): Promise<object[]> {
      return super._getEntries(feed, facet, start, end);
   }

}

describe('FeedReader', function() {

   describe('read', function() {

      it('handles an empty set of events', function() {
         const reader = new TestFeedReader('TestTable'),
               getEntriesStub = sinon.stub(reader, '_getEntries');

         getEntriesStub.returns(Promise.resolve([]));

         return reader.read('testFeed', 'testFacet', new TimeRange('2019-01-01T00:00:00Z', '2020-01-01T00:00:00Z'))
            .then((entries) => {
               expect(entries).to.eql([]);
               sinon.assert.calledOnce(getEntriesStub);
               sinon.assert.calledWithExactly(
                  getEntriesStub,
                  'testFeed',
                  'testFacet',
                  '2019-01-01T00:00:00.000Z',
                  '2020-01-01T00:00:00.000Z'
               );
            });
      });

      // TODO: More tests

   });

   describe('_getEntries', function() {

      afterEach(() => AWS.restore());

      it('handles an empty response', function() {
         const resp: DynamoDB.DocumentClient.QueryOutput = {
            Items: [],
            Count: 0,
            ScannedCount: 0,
         };

         AWS.mock('DynamoDB.DocumentClient', 'query', Promise.resolve(resp));

         const reader = new TestFeedReader('TestTable');

         return reader._getEntries('testFeed', 'testFacet', '2019-01-01T00:00:00.000Z', '2020-01-01T00:00:00.000Z')
            .then((entries) => {
               expect(entries).to.eql([]);
            });
      });

      // TODO: More tests

   });

});
