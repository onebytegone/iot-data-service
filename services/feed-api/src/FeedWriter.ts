import _ from 'underscore';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import util from 'util';

const docs = new DocumentClient();

export default class FeedWriter {

   public constructor(
      private _feedTableName: string = process.env.FEED_TABLE_NAME as string
   ) { }

   public write(feed: string, facet: string, feedEvent: FeedEvent): Promise<void> {
      return this._writeToTable([
         this._convertFeedEventToTableInsert(feed, facet, feedEvent),
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

   protected _writeToTable(feedEventInserts: DocumentClient.WriteRequests): Promise<void> {
      const batchWrite = util.promisify(docs.batchWrite.bind(docs));

      const params: DocumentClient.BatchWriteItemInput = {
         RequestItems: {
            [this._feedTableName]: feedEventInserts,
         },
      };

      // TODO: Retry unprocessed items
      // https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchWriteItem.html
      return batchWrite(params).then(_.noop);
   }

}
