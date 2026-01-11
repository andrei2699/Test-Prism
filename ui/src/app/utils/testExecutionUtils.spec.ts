import { getLastExecution } from './testExecutionUtils';
import { Test } from '../types/TestReport';

describe('getLastExecution', () => {
  it('should return undefined for tests with no executions', () => {
    const test = { name: 'Test 1', path: '/tests/test1', executions: [] };

    expect(getLastExecution(test)).toBeUndefined();
  });

  it('should return undefined for tests with undefined executions', () => {
    const test = {
      name: 'Test 2',
      path: '/tests/test2',
      executions: undefined,
    } as unknown as Test;

    expect(getLastExecution(test)).toBeUndefined();
  });

  it('should return the last execution based on timestamp', () => {
    const test: Test = {
      name: 'Test 2',
      path: '/tests/test2',
      executions: [
        { status: 'PASSED', durationMs: 100, timestamp: '2023-01-01T10:00:00Z' },
        { status: 'FAILED', durationMs: 150, timestamp: '2023-01-02T12:00:00Z' },
        { status: 'SKIPPED', durationMs: 50, timestamp: '2023-01-01T15:00:00Z' },
      ],
    };

    const lastExecution = getLastExecution(test);
    expect(lastExecution).toEqual({
      status: 'FAILED',
      durationMs: 150,
      timestamp: '2023-01-02T12:00:00Z',
    });
  });
});
