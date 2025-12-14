import { ExecutionTypeOrganizationStrategy } from './execution-type-organization.strategy';
import { Test } from '../../../types/TestReport';

describe('ExecutionTypeOrganizationStrategy', () => {
  let strategy: ExecutionTypeOrganizationStrategy;

  beforeEach(() => {
    strategy = new ExecutionTypeOrganizationStrategy();
  });

  it('should return empty array for empty tests', () => {
    expect(strategy.buildTree([])).toEqual([]);
  });

  it('should group tests by execution status', () => {
    const tests: Test[] = [
      { name: 'test1', path: '/folder/test1', lastExecutionType: 'SUCCESS' },
      { name: 'test2', path: '/folder/test2', lastExecutionType: 'FAILURE' },
      { name: 'test3', path: '/folder/test3', lastExecutionType: 'SUCCESS' },
    ];

    const result = strategy.buildTree(tests);

    const successGroup = result.find(n => n.name === 'SUCCESS');
    const failureGroup = result.find(n => n.name === 'FAILURE');

    expect(successGroup?.children).toHaveLength(2);
    expect(failureGroup?.children).toHaveLength(1);
  });

  it('should sort by status order (SUCCESS, FAILURE, SKIPPED, ERROR)', () => {
    const tests: Test[] = [
      { name: 'test1', path: '/test1', lastExecutionType: 'ERROR' },
      { name: 'test2', path: '/test2', lastExecutionType: 'SUCCESS' },
      { name: 'test3', path: '/test3', lastExecutionType: 'FAILURE' },
      { name: 'test4', path: '/test4', lastExecutionType: 'SKIPPED' },
    ];

    const result = strategy.buildTree(tests);
    const statusNames = result.map(n => n.name);

    expect(statusNames).toEqual(['SUCCESS', 'FAILURE', 'SKIPPED', 'ERROR']);
  });

  it('should preserve test metadata in status groups', () => {
    const tests: Test[] = [{ name: 'test1', path: '/folder/test1', lastExecutionType: 'FAILURE' }];

    const result = strategy.buildTree(tests);
    const testNode = result[0].children?.[0];

    expect(testNode?.test?.name).toBe('test1');
    expect(testNode?.test?.path).toBe('/folder/test1');
  });

  it('should handle tests with different execution types', () => {
    const tests: Test[] = [
      { name: 'test1', path: '/test1', lastExecutionType: 'SUCCESS' },
      { name: 'test2', path: '/test2', lastExecutionType: 'FAILURE' },
      { name: 'test3', path: '/test3', lastExecutionType: 'SKIPPED' },
      { name: 'test4', path: '/test4', lastExecutionType: 'ERROR' },
    ];

    const result = strategy.buildTree(tests);

    expect(result).toHaveLength(4);
    expect(result[0].children).toHaveLength(1);
    expect(result[1].children).toHaveLength(1);
    expect(result[2].children).toHaveLength(1);
    expect(result[3].children).toHaveLength(1);
  });

  it('should calculate total duration for status groups', () => {
    const tests: Test[] = [
      { name: 'test1', path: '/test1', lastExecutionType: 'SUCCESS', durationMs: 1000 },
      { name: 'test2', path: '/test2', lastExecutionType: 'SUCCESS', durationMs: 2000 },
      { name: 'test3', path: '/test3', lastExecutionType: 'FAILURE', durationMs: 3000 },
    ];

    const result = strategy.buildTree(tests);

    const successGroup = result.find(n => n.name === 'SUCCESS');
    const failureGroup = result.find(n => n.name === 'FAILURE');

    expect(successGroup?.totalDurationMs).toBe(3000);
    expect(failureGroup?.totalDurationMs).toBe(3000);
  });

  it('should sum durations across multiple tests in same group', () => {
    const tests: Test[] = [
      { name: 'test1', path: '/test1', lastExecutionType: 'SUCCESS', durationMs: 500 },
      { name: 'test2', path: '/test2', lastExecutionType: 'SUCCESS', durationMs: 750 },
      { name: 'test3', path: '/test3', lastExecutionType: 'SUCCESS', durationMs: 250 },
    ];

    const result = strategy.buildTree(tests);

    expect(result[0].totalDurationMs).toBe(1500);
  });
});
