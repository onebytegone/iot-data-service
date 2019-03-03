interface FeedEvent {
   timestamp: string;
   value: number;
}

interface FeedAggregationRequest {
   feed: string;
   facet: string;
   start: string;
   end?: string;
   span?: string;
   aggregation?: string;
}

interface FeedAggregationResponse {
   feed: string;
   facet: string;
   start: string | null;
   end: string | null;
   span: string;
   aggregation: string;
   results: FeedAggregationResponseEvent[];
}

interface FeedAggregationResponseEvent {
   timestamp: string;
   value: number;
}
