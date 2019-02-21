import _ from 'underscore';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import MovingMetricProcessor from './lib/MovingMetricProcessor';

const docs = new DocumentClient();

export default class FeedWriter {

   public constructor(
      private _feedTableName: string = process.env.FEED_TABLE_NAME as string
   ) { }

   public write(feed: string, facet: string, feedEvent: FeedEvent): Promise<void[]> {
      const movingMetricProcessor = new MovingMetricProcessor();

      // TODO: Should be using something like Q.allSettled here?
      return Promise.all([
         this._writeToTable([
            this._convertFeedEventToTableInsert(feed, facet, feedEvent),
         ]),
         movingMetricProcessor.updateMovingMetrics(feed, facet, feedEvent).then(_.noop),
      ]);
   }

   protected _convertFeedEventToTableInsert(feed: string, facet: string, feedEvent: FeedEvent): DocumentClient.WriteRequest {
      return {
         PutRequest: {
            Item: {
               feedAndFacet: feed + ':' + facet,
               timestamp: feedEvent.timestamp,
               value: feedEvent.value,
            },
         },
      };
   }

   protected _writeToTable(writeRequests: DocumentClient.WriteRequests): Promise<void> {
      const params: DocumentClient.BatchWriteItemInput = {
         RequestItems: {
            [this._feedTableName]: writeRequests,
         },
      };

      // TODO: Retry unprocessed items
      // https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchWriteItem.html
      return docs.batchWrite(params).promise().then(_.noop);
   }

}
