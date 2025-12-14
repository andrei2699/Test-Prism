import { DistributionDataItem } from './distribution-data.interface';
import { DistributionStrategy } from './distribution-strategy.interface';
import { Test } from '../../../types/TestReport';

export const DURATION_COLORS = {
  SHORT: '#4caf50',
  MEDIUM: '#ffc107',
  LONG: '#f44336',
};

export class DurationDistributionStrategy implements DistributionStrategy {
  calculateDistribution(tests: Test[]): DistributionDataItem[] {
    let greenCount = 0;
    let yellowCount = 0;
    let redCount = 0;

    tests.forEach(test => {
      const duration = test.durationMs ?? 0;

      if (duration < 500) {
        greenCount++;
      } else if (duration >= 500 && duration < 2000) {
        yellowCount++;
      } else {
        redCount++;
      }
    });

    return [
      { label: 'Under 500ms', count: greenCount, color: DURATION_COLORS.SHORT },
      { label: '500ms - 2s', count: yellowCount, color: DURATION_COLORS.MEDIUM },
      { label: 'Over 2s', count: redCount, color: DURATION_COLORS.LONG },
    ];
  }
}
