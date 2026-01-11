import { describe, expect, it } from 'vitest';
import { ExecutionTypeDistributionStrategy } from './execution-type-distribution.strategy';
import { Test } from '../../../../types/TestReport';
import { TestColors } from '../../../../types/Layout';

const colors: TestColors = {
  SUCCESS: 'green',
  FAILURE: 'red',
  SKIPPED: 'yellow',
  ERROR: 'orange',
};

describe('ExecutionTypeDistributionStrategy', () => {
  it('should calculate the distribution of tests by execution type', () => {
    const strategy = new ExecutionTypeDistributionStrategy();
    const tests: Test[] = [
      {
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        name: 'test1',
        path: '/test1',
      },
      {
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        name: 'test2',
        path: '/test2',
      },
      {
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'FAILURE', durationMs: 100 }],
        name: 'test3',
        path: '/test3',
      },
      {
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SKIPPED', durationMs: 100 }],
        name: 'test4',
        path: '/test4',
      },
      {
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'ERROR', durationMs: 100 }],
        name: 'test5',
        path: '/test5',
      },
    ];

    const distribution = strategy.calculateDistribution(tests, colors);

    expect(distribution).toEqual([
      { label: 'SUCCESS', count: 2, color: 'green' },
      { label: 'FAILURE', count: 1, color: 'red' },
      { label: 'SKIPPED', count: 1, color: 'yellow' },
      { label: 'ERROR', count: 1, color: 'orange' },
    ]);
  });

  it('should return an empty array if there are no tests', () => {
    const strategy = new ExecutionTypeDistributionStrategy();
    const tests: Test[] = [];

    const distribution = strategy.calculateDistribution(tests, colors);

    expect(distribution).toEqual([]);
  });
});
