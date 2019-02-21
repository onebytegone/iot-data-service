type MovingMetricIntervalUnit = 'm' | 'h' | 'd';

interface MovingMetricGrouping {
   [type: string]: MovingMetricObject;
}

interface MovingMetricObject {
   value?: number;
}

interface MovingMetricInterval {
   precision: number;
   unit: MovingMetricIntervalUnit;
}
