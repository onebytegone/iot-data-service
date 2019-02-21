import _ from 'underscore';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import Aggregator from '../aggregators/Aggregator';
import AverageAggregator from '../aggregators/AverageAggregator';
import FirstAggregator from '../aggregators/FirstAggregator';
import LastAggregator from '../aggregators/LastAggregator';
import MaxAggregator from '../aggregators/MaxAggregator';
import MinAggregator from '../aggregators/MinAggregator';
import SumAggregator from '../aggregators/SumAggregator';
import roundMomentToInterval from './roundMomentToInterval';

export default class MovingMetricProcessor {

   public movingMetricIntervals: MovingMetricInterval[] = [
      { precision: 5, unit: 'm' },
      { precision: 15, unit: 'm' },
      { precision: 30, unit: 'm' },
      { precision: 1, unit: 'h' },
      { precision: 3, unit: 'h' },
      { precision: 6, unit: 'h' },
      { precision: 12, unit: 'h' },
      { precision: 1, unit: 'd' },
   ];

   private _docs: DocumentClient;
   private _movingMetricAggregators: { [name: string]: Aggregator } = {};

   public constructor(
      private _metricTableName: string = process.env.FEED_TABLE_NAME as string
   ) {
      this._docs = new DocumentClient();
      this._movingMetricAggregators[AverageAggregator.type] = new AverageAggregator();
      this._movingMetricAggregators[FirstAggregator.type] = new FirstAggregator();
      this._movingMetricAggregators[LastAggregator.type] = new LastAggregator();
      this._movingMetricAggregators[MaxAggregator.type] = new MaxAggregator();
      this._movingMetricAggregators[MinAggregator.type] = new MinAggregator();
      this._movingMetricAggregators[SumAggregator.type] = new SumAggregator();
   }

   public getMovingMetric(
      feed: string,
      facet: string,
      interval: MovingMetricInterval,
      metricType: string,
      timestamp: string
   ): Promise<number | undefined> {
      const params: DocumentClient.BatchGetItemInput = {
         RequestItems: {
            [this._metricTableName]: {
               Keys: [
                  {
                     feedAndFacet: this._makeKeyForMovingMetric(feed, facet, interval),
                     timestamp: this._makeTimestampForMovingMetric(timestamp, interval),
                  },
               ],
            },
         },
      };

      // TODO: Retry unprocessed items
      return this._docs.batchGet(params).promise()
         .then((resp) => {
            const itemsFromTable = resp.Responses ? resp.Responses[this._metricTableName] : [],
                  metricGrouping = _.first(itemsFromTable),
                  requestedMetric = metricGrouping ? metricGrouping[metricType] : {};

            return requestedMetric.value;
         });
   }

   public updateMovingMetrics(feed: string, facet: string, feedEvent: FeedEvent): Promise<void> {
      const params: DocumentClient.BatchGetItemInput = {
         RequestItems: {
            [this._metricTableName]: {
               Keys: _.map(this.movingMetricIntervals, (interval) => ({
                  feedAndFacet: this._makeKeyForMovingMetric(feed, facet, interval),
                  timestamp: this._makeTimestampForMovingMetric(feedEvent.timestamp, interval),
               })),
            },
         },
      };

      // TODO: Retry unprocessed items
      return this._docs.batchGet(params).promise()
         .then((resp) => {
            const items = resp.Responses ? resp.Responses[this._metricTableName] : [];

            const requests = _.map(this.movingMetricIntervals, (interval): DocumentClient.WriteRequest => {
               const feedAndFacet = this._makeKeyForMovingMetric(feed, facet, interval),
                     timestamp = this._makeTimestampForMovingMetric(feedEvent.timestamp, interval),
                     entryForTimestamp = _.findWhere(items, { feedAndFacet: feedAndFacet, timestamp: timestamp }) || {},
                     previousMovingMetrics = entryForTimestamp.metrics as { [name: string]: MovingMetricObject } || undefined;

               const updatedMetrics = _.mapObject(this._movingMetricAggregators, (aggregator, type) => {
                  const previousMovingMetric = previousMovingMetrics ? previousMovingMetrics[type] : undefined;

                  return aggregator.calculateMovingMetric(previousMovingMetric, feedEvent.value);
               });

               return {
                  PutRequest: {
                     Item: {
                        feedAndFacet: feedAndFacet,
                        timestamp: timestamp,
                        metrics: updatedMetrics as object,
                     },
                  },
               };
            });

            return this._writeToTable(requests);
         });
   }

   private _writeToTable(writeRequests: DocumentClient.WriteRequests): Promise<void> {
      const params: DocumentClient.BatchWriteItemInput = {
         RequestItems: {
            [this._metricTableName]: writeRequests,
         },
      };

      // TODO: Retry unprocessed items
      // https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchWriteItem.html
      return this._docs.batchWrite(params).promise().then(_.noop);
   }

   private _makeKeyForMovingMetric(feed: string, facet: string, interval: { precision: number; unit: MovingMetricIntervalUnit}): string {
      return feed + ':' + facet + ':movingMetric:' + interval.precision + interval.unit;
   }

   private _makeTimestampForMovingMetric(timestamp: string, interval: { precision: number; unit: MovingMetricIntervalUnit}): string {
      return roundMomentToInterval(timestamp, interval.precision, interval.unit).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
   }

}
