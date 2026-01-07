import { describe, expect, it } from 'vitest';
import { ExecutionTypeDistributionStrategy } from './execution-type-distribution.strategy';
import { Test } from '../../../../types/TestReport';
import { EXECUTION_TYPE_COLORS } from '../../../../shared/execution-type-colors';

describe('ExecutionTypeDistributionStrategy', () => {
  it('should calculate the distribution of tests by execution type', () => {
    const strategy = new ExecutionTypeDistributionStrategy();
    const tests: Test[] = [
      { lastExecutionType: 'SUCCESS', name: 'test1', path: '/test1' },
      { lastExecutionType: 'SUCCESS', name: 'test2', path: '/test2' },
      { lastExecutionType: 'FAILURE', name: 'test3', path: '/test3' },
      { lastExecutionType: 'SKIPPED', name: 'test4', path: '/test4' },
      { lastExecutionType: 'ERROR', name: 'test5', path: '/test5' },
    ];

    const distribution = strategy.calculateDistribution(tests);

    expect(distribution).toEqual([
      { label: 'SUCCESS', count: 2, color: EXECUTION_TYPE_COLORS.SUCCESS },
      { label: 'FAILURE', count: 1, color: EXECUTION_TYPE_COLORS.FAILURE },
      { label: 'SKIPPED', count: 1, color: EXECUTION_TYPE_COLORS.SKIPPED },
      { label: 'ERROR', count: 1, color: EXECUTION_TYPE_COLORS.ERROR },
    ]);
  });

  it('should return an empty array if there are no tests', () => {
    const strategy = new ExecutionTypeDistributionStrategy();
    const tests: Test[] = [];

    const distribution = strategy.calculateDistribution(tests);

    expect(distribution).toEqual([]);
  });
});
