import { Context, Callback } from 'aws-lambda';
import _ from 'underscore';
import moment from 'moment';
import TimeRange from './model/TimeRange';
import FeedWriter from './FeedWriter';
import FeedEventAggregator from './FeedEventAggregator';

const pathToRegexp = require('path-to-regexp'),
      APIGWUtils = require('@silvermine/apigateway-utils'),
      rbHandler = APIGWUtils.get('responseBuilderHandler'),
      Request = APIGWUtils.get('Request'),
      ResponseBuilder = APIGWUtils.get('SilvermineResponseBuilder');

// eslint-disable-next-line @typescript-eslint/no-type-alias
type SilvermineRequest = InstanceType<typeof Request>;
// eslint-disable-next-line @typescript-eslint/no-type-alias
type SilvermineResponseBuilder = InstanceType<typeof ResponseBuilder>;

function handleReadRequest(feed: string, facet: string, request: SilvermineRequest):
   SilvermineResponseBuilder | Promise<SilvermineResponseBuilder> {
   const resp = new ResponseBuilder(),
         aggregator = new FeedEventAggregator(),
         start = request.query('start') || '2000-01-01T00:00:00Z', // TODO: default to -5m
         end = request.query('end'),
         span = request.query('span') || '1m',
         aggregation = request.query('aggregation') || 'avg';

   // TODO: sanitize and validate values from start, end, span, and aggregation

   return aggregator.aggregate(feed, facet, new TimeRange(start, end), span, aggregation)
      .then(resp.body.bind(resp));
}

function handleWriteRequest(feed: string, facet: string, request: InstanceType<typeof Request>):
   SilvermineResponseBuilder | Promise<SilvermineResponseBuilder> {
   const resp = new ResponseBuilder(),
         writer = new FeedWriter(),
         body = request.parsedBody();

   if (!body) {
      return resp.badRequest('Invalid body').rb();
   }

   if (!_.has(body, 'value')) {
      return resp.badRequest('Body is missing \'value\'').rb();
   }

   // TODO: sanitize and validate timestamp and value formats

   const event: FeedEvent = {
      timestamp: body.timestamp || moment().utc().format('YYYY-MM-DDTHH:mm:ssZ'),
      value: body.value,
   };

   return writer.write(feed, facet, event)
      .then(function() {
         return resp.body({});
      });
}

export function handler(evt: any, context: Context, cb: Callback): void {
   // TODO: replace with lambda-express once it is somewhat functional

   const request = new Request(evt, context),
         resp = new ResponseBuilder();

   const fn = function(): SilvermineResponseBuilder {
      const pathParts = pathToRegexp(':feed/:facet').exec(request.pathParam('proxy'));

      if (!pathParts) {
         return resp.badRequest('Unknown resource').rb();
      }

      const feed = pathParts[1].toLowerCase(),
            facet = pathParts[2].toLowerCase();

      // TODO: sanitize and validate values from feed and facet

      if (request.method() === 'GET') {
         return handleReadRequest(feed, facet, request);
      } else if (request.method() === 'POST') {
         return handleWriteRequest(feed, facet, request);
      }

      return resp.notImplemented().rb();
   };

   rbHandler(fn, request, cb, ResponseBuilder);
}
