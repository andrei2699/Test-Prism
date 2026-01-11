import { describe, expect, it } from 'vitest';
import { StatusFilterStrategy } from './status-filter.strategy';
import { Test, TestExecutionType } from '../../../../../types/TestReport';

const testData: Test[] = [
  {
    name: 'ErrorTest.spec.ts',
    path: 'src/tests',
    executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'ERROR', durationMs: 100 }],
  },
  {
    name: 'SkippedTest.spec.ts',
    path: 'src/tests',
    executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SKIPPED', durationMs: 100 }],
  },
  {
    name: 'LoginPage.spec.ts',
    path: 'src/pages',
    executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'FAILURE', durationMs: 100 }],
  },
  {
    name: 'UserService.spec.ts',
    path: 'src/services',
    executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
  },
  {
    name: 'LoginComponent.spec.ts',
    path: 'src/auth',
    executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
  },
];

describe('StatusFilterStrategy', () => {
  it('should handle all status types', () => {
    const allStatuses: TestExecutionType[] = ['SUCCESS', 'FAILURE', 'SKIPPED', 'ERROR'];
    const strategy = new StatusFilterStrategy(allStatuses);
    const result = strategy.filter(testData);

    expect(result).toHaveLength(5);
  });

  it('should return empty array when no tests match selected statuses', () => {
    const strategy = new StatusFilterStrategy(['ERROR']);
    const result = strategy.filter(testData);

    expect(result[0].executions[0].status).toBe('ERROR');
    expect(result).toHaveLength(1);
  });

  it('should filter tests by multiple statuses', () => {
    const strategy = new StatusFilterStrategy(['SUCCESS', 'FAILURE']);
    const result = strategy.filter(testData);

    expect(
      result.every(
        (test: Test) =>
          test.executions[0].status === 'SUCCESS' || test.executions[0].status === 'FAILURE',
      ),
    ).toBe(true);
    expect(result).toHaveLength(3);
  });

  it('should filter tests by single status', () => {
    const strategy = new StatusFilterStrategy(['SUCCESS']);
    const result = strategy.filter(testData);

    expect(result.every((test: Test) => test.executions[0].status === 'SUCCESS')).toBe(true);
    expect(result).toHaveLength(2);
  });

  it('should return all tests when no statuses are selected', () => {
    const strategy = new StatusFilterStrategy([]);
    const result = strategy.filter(testData);

    expect(result).toHaveLength(5);
  });
});
