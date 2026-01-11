import { DurationDistributionStrategy, DurationInterval } from './duration-distribution.strategy';
import { Test } from '../../../../types/TestReport';

const defaultIntervals: DurationInterval[] = [
  {
    max: 1000,
    color: '#4CAF50',
  },
  {
    min: 1000,
    max: 5000,
    color: '#FFC107',
  },
  {
    min: 5000,
    color: '#F44336',
  },
];

describe('DurationDistributionStrategy', () => {
  describe('with default intervals', () => {
    let strategy: DurationDistributionStrategy;

    beforeEach(() => {
      strategy = new DurationDistributionStrategy({ intervals: defaultIntervals });
    });

    it('should correctly categorize tests by duration', () => {
      const tests: Test[] = [
        {
          executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 50 }],
        } as Test,
        {
          executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 999 }],
        } as Test,
        {
          executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 1000 }],
        } as Test,
        {
          executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 4999 }],
        } as Test,
        {
          executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 5000 }],
        } as Test,
        {
          executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 10000 }],
        } as Test,
        {
          executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 0 }],
        } as Test,
      ];

      const distribution = strategy.calculateDistribution(tests);

      expect(distribution).toEqual([
        { label: 'Under 1 second', count: 3, color: '#4CAF50' },
        { label: '1 second - 5 seconds', count: 2, color: '#FFC107' },
        { label: 'Over 5 seconds', count: 2, color: '#F44336' },
      ]);
    });

    it('should handle empty test array', () => {
      const tests: Test[] = [];
      const distribution = strategy.calculateDistribution(tests);

      expect(distribution).toEqual([
        { label: 'Under 1 second', count: 0, color: '#4CAF50' },
        { label: '1 second - 5 seconds', count: 0, color: '#FFC107' },
        { label: 'Over 5 seconds', count: 0, color: '#F44336' },
      ]);
    });

    it('should handle tests with only one category', () => {
      const tests: Test[] = [
        {
          executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 10 }],
        } as Test,
        {
          executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 20 }],
        } as Test,
        {
          executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 30 }],
        } as Test,
      ];
      const distribution = strategy.calculateDistribution(tests);

      expect(distribution).toEqual([
        { label: 'Under 1 second', count: 3, color: '#4CAF50' },
        { label: '1 second - 5 seconds', count: 0, color: '#FFC107' },
        { label: 'Over 5 seconds', count: 0, color: '#F44336' },
      ]);
    });
  });

  describe('with custom intervals', () => {
    it('should correctly categorize tests with custom intervals', () => {
      const intervals: DurationInterval[] = [
        { label: 'Fast', color: 'blue', max: 100 },
        { label: 'Medium', color: 'green', min: 100, max: 1000 },
        { label: 'Slow', color: 'orange', min: 1000 },
      ];
      const strategy = new DurationDistributionStrategy({ intervals });
      const tests: Test[] = [
        {
          executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 50 }],
        } as Test,
        {
          executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        } as Test,
        {
          executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 500 }],
        } as Test,
        {
          executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 1000 }],
        } as Test,
        {
          executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 2000 }],
        } as Test,
      ];

      const distribution = strategy.calculateDistribution(tests);

      expect(distribution).toEqual([
        { label: 'Fast', count: 1, color: 'blue' },
        { label: 'Medium', count: 2, color: 'green' },
        { label: 'Slow', count: 2, color: 'orange' },
      ]);
    });

    it('should generate labels if not provided', () => {
      const intervals: DurationInterval[] = [
        { color: 'blue', max: 100 },
        { color: 'green', min: 100, max: 1000 },
        { color: 'orange', min: 1000 },
      ];
      const strategy = new DurationDistributionStrategy({ intervals });
      const tests: Test[] = [];

      const distribution = strategy.calculateDistribution(tests);

      expect(distribution.map(d => d.label)).toEqual([
        'Under 0.1 seconds',
        '0.1 seconds - 1 second',
        'Over 1 second',
      ]);
    });
  });
});
