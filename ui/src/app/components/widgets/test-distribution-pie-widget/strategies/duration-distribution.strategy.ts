import { DistributionDataItem } from './distribution-data.interface';
import { DistributionStrategy } from './distribution-strategy.interface';
import { Test } from '../../../../types/TestReport';
import humanizeDuration from 'humanize-duration';

export interface DurationDistributionStrategyParameters {
  intervals: DurationInterval[];
}

export interface DurationInterval {
  label?: string;
  color: string;
  min?: number;
  max?: number;
}

export class DurationDistributionStrategy implements DistributionStrategy {
  private readonly intervals: DurationInterval[];

  constructor(parameters: DurationDistributionStrategyParameters) {
    this.intervals = parameters.intervals;
  }

  calculateDistribution(tests: Test[]): DistributionDataItem[] {
    const counts = new Array(this.intervals.length).fill(0);

    tests.forEach(test => {
      const lastExecution = test.executions[test.executions.length - 1];
      const duration = lastExecution?.durationMs ?? 0;
      const intervalIndex = this.intervals.findIndex(interval => {
        const min = interval.min ?? 0;
        const max = interval.max ?? Infinity;
        return duration >= min && duration < max;
      });

      if (intervalIndex !== -1) {
        counts[intervalIndex]++;
      }
    });

    return this.intervals.map((interval, index) => ({
      label: this.getIntervalLabel(index),
      count: counts[index],
      color: interval.color,
    }));
  }

  private getIntervalLabel(index: number): string {
    const interval = this.intervals[index];
    if (interval.label) {
      return interval.label;
    }

    const { min, max } = interval;

    if (min === undefined && max !== undefined) {
      return `Under ${humanizeDuration(max)}`;
    }
    if (min !== undefined && max === undefined) {
      return `Over ${humanizeDuration(min)}`;
    }
    if (min !== undefined && max !== undefined) {
      return `${humanizeDuration(min)} - ${humanizeDuration(max)}`;
    }
    return 'All durations';
  }
}
