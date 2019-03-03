import _ from 'underscore';
import TimeRange from './model/TimeRange';
import FeedReader from './FeedReader';
import Aggregator from './aggregators/Aggregator';
import AverageAggregator from './aggregators/AverageAggregator';
import FirstAggregator from './aggregators/FirstAggregator';
import LastAggregator from './aggregators/LastAggregator';
import MaxAggregator from './aggregators/MaxAggregator';
import MinAggregator from './aggregators/MinAggregator';
import SumAggregator from './aggregators/SumAggregator';

export default class FeedEventAggregator {

   private _aggregators: { [name: string]: Aggregator } = {};

   public constructor(
      private _feedReader = new FeedReader(),
   ) {
      this._aggregators[AverageAggregator.type] = new AverageAggregator();
      this._aggregators[FirstAggregator.type] = new FirstAggregator();
      this._aggregators[LastAggregator.type] = new LastAggregator();
      this._aggregators[MaxAggregator.type] = new MaxAggregator();
      this._aggregators[MinAggregator.type] = new MinAggregator();
      this._aggregators[SumAggregator.type] = new SumAggregator();
   }

   public aggregate(
      feed: string,
      facet: string,
      timeRange: TimeRange,
      span: string,
      aggregation: string
   ): Promise<FeedAggregationResponse> {
      let aggregator = this._aggregators[aggregation];

      if (!aggregator) {
         throw new Error(`Could not find aggregator for "${aggregation}"`);
      }

      return this._feedReader.read(feed, facet, timeRange)
         .then((events): FeedAggregationResponse => {
            const aggregatedEvents = aggregator.aggregateEvents(events, span),
                  earliestEvent = _.first(aggregatedEvents),
                  latestEvent = _.last(aggregatedEvents);

            return {
               feed: feed,
               facet: facet,
               start: earliestEvent ? earliestEvent.timestamp : null,
               end: latestEvent ? latestEvent.timestamp : null,
               span: span,
               aggregation: aggregation,
               results: aggregatedEvents,
            };
         });
   }

}
