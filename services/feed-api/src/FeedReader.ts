import _ from 'underscore';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import TimeRange from './model/TimeRange';

export default class FeedReader {

   private _docs: DocumentClient;

   public constructor(
      private _feedTableName: string = process.env.FEED_TABLE_NAME as string
   ) {
      this._docs = new DocumentClient();
   }

   public read(feed: string, facet: string, timeRange: TimeRange): Promise<FeedEvent[]> {
      return this._getEntries(feed, facet, timeRange.getStartAsISO8061(), timeRange.getEndAsISO8061())
         .then((rawEntries) => _.map(rawEntries, (entry) => _.pick(entry, 'timestamp', 'value')));
   }

   protected _getEntries(feed: string, facet: string, start: string, end: string): Promise<object[]> {
      const params: DocumentClient.QueryInput = {
         TableName: this._feedTableName,
         KeyConditionExpression: 'feedAndFacet = :feedAndFacet AND #timestampField BETWEEN :start AND :end',
         ExpressionAttributeNames: {
            '#timestampField': 'timestamp',
         },
         ExpressionAttributeValues: {
            ':feedAndFacet': `${feed}:${facet}`,
            ':start': start,
            ':end': end,
         },
      };

      return this._docs.query(params).promise()
         .then((resp) => resp.Items || []);
   }

}
