import { DURATION_COLORS, DurationDistributionStrategy } from './duration-distribution.strategy';
import { Test } from '../../../types/TestReport';

describe('DurationDistributionStrategy', () => {
  let strategy: DurationDistributionStrategy;

  beforeEach(() => {
    strategy = new DurationDistributionStrategy();
  });

  it('should correctly categorize tests by duration', () => {
    const tests: Test[] = [
      { durationMs: 50 } as Test,
      { durationMs: 499 } as Test,
      { durationMs: 500 } as Test,
      { durationMs: 1500 } as Test,
      { durationMs: 1999 } as Test,
      { durationMs: 2000 } as Test,
      { durationMs: 2500 } as Test,
      { durationMs: 0 } as Test,
    ];

    const distribution = strategy.calculateDistribution(tests);

    expect(distribution).toEqual([
      { label: 'Under 500ms', count: 3, color: DURATION_COLORS.SHORT },
      { label: '500ms - 2s', count: 3, color: DURATION_COLORS.MEDIUM },
      { label: 'Over 2s', count: 2, color: DURATION_COLORS.LONG },
    ]);
  });

  it('should handle empty test array', () => {
    const tests: Test[] = [];
    const distribution = strategy.calculateDistribution(tests);

    expect(distribution).toEqual([
      { label: 'Under 500ms', count: 0, color: DURATION_COLORS.SHORT },
      { label: '500ms - 2s', count: 0, color: DURATION_COLORS.MEDIUM },
      { label: 'Over 2s', count: 0, color: DURATION_COLORS.LONG },
    ]);
  });

  it('should handle tests with only one category', () => {
    const tests: Test[] = [
      { durationMs: 10 } as Test,
      { durationMs: 20 } as Test,
      { durationMs: 30 } as Test,
    ];
    const distribution = strategy.calculateDistribution(tests);

    expect(distribution).toEqual([
      { label: 'Under 500ms', count: 3, color: DURATION_COLORS.SHORT },
      { label: '500ms - 2s', count: 0, color: DURATION_COLORS.MEDIUM },
      { label: 'Over 2s', count: 0, color: DURATION_COLORS.LONG },
    ]);
  });
});
