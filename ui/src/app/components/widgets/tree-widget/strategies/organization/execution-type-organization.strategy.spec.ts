import { ExecutionTypeOrganizationStrategy } from './execution-type-organization.strategy';
import { Test } from '../../../../../types/TestReport';
import { TestTreeNode } from '../../test-tree/test-tree';

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
      {
        name: 'test1',
        path: '/folder/test1',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 100 }],
      },
      {
        name: 'test2',
        path: '/folder/test2',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'FAILED', durationMs: 100 }],
      },
      {
        name: 'test3',
        path: '/folder/test3',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 100 }],
      },
    ];

    const result = strategy.buildTree(tests);

    const expectedResult: TestTreeNode[] = [
      {
        id: 'PASSED',
        name: 'PASSED',
        children: [
          {
            id: '/folder/test1/test1',
            name: 'test1',
            test: tests[0],
            testCount: { PASSED: 1, FAILED: 0, SKIPPED: 0, ERROR: 0 },
          },
          {
            id: '/folder/test3/test3',
            name: 'test3',
            test: tests[2],
            testCount: { PASSED: 1, FAILED: 0, SKIPPED: 0, ERROR: 0 },
          },
        ],
        totalDurationMs: 200,
        testCount: {
          PASSED: 2,
          FAILED: 0,
          SKIPPED: 0,
          ERROR: 0,
        },
      },
      {
        id: 'FAILED',
        name: 'FAILED',
        children: [
          {
            id: '/folder/test2/test2',
            name: 'test2',
            test: tests[1],
            testCount: { PASSED: 0, FAILED: 1, SKIPPED: 0, ERROR: 0 },
          },
        ],
        totalDurationMs: 100,
        testCount: {
          PASSED: 0,
          FAILED: 1,
          SKIPPED: 0,
          ERROR: 0,
        },
      },
    ];

    expect(result).toEqual(expectedResult);
  });

  it('should sort by status order (PASSED, FAILED, SKIPPED, ERROR)', () => {
    const tests: Test[] = [
      {
        name: 'test1',
        path: '/test1',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'ERROR', durationMs: 100 }],
      },
      {
        name: 'test2',
        path: '/test2',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 100 }],
      },
      {
        name: 'test3',
        path: '/test3',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'FAILED', durationMs: 100 }],
      },
      {
        name: 'test4',
        path: '/test4',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SKIPPED', durationMs: 100 }],
      },
    ];

    const result = strategy.buildTree(tests);
    const statusNames = result.map(n => n.name);

    expect(statusNames).toEqual(['PASSED', 'FAILED', 'SKIPPED', 'ERROR']);
  });

  it('should preserve test metadata in status groups', () => {
    const tests: Test[] = [
      {
        name: 'test1',
        path: '/folder/test1',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'FAILED', durationMs: 100 }],
      },
    ];

    const result = strategy.buildTree(tests);
    const expectedTestNode: TestTreeNode = {
      id: '/folder/test1/test1',
      name: 'test1',
      test: tests[0],
      testCount: { PASSED: 0, FAILED: 1, SKIPPED: 0, ERROR: 0 },
    };

    expect(result[0].children?.[0]).toEqual(expectedTestNode);
  });

  it('should handle tests with different execution types', () => {
    const tests: Test[] = [
      {
        name: 'test1',
        path: '/test1',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 100 }],
      },
      {
        name: 'test2',
        path: '/test2',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'FAILED', durationMs: 100 }],
      },
      {
        name: 'test3',
        path: '/test3',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SKIPPED', durationMs: 100 }],
      },
      {
        name: 'test4',
        path: '/test4',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'ERROR', durationMs: 100 }],
      },
    ];

    const result = strategy.buildTree(tests);

    const expectedResult: TestTreeNode[] = [
      {
        id: 'PASSED',
        name: 'PASSED',
        children: [
          {
            id: '/test1/test1',
            name: 'test1',
            test: tests[0],
            testCount: { PASSED: 1, FAILED: 0, SKIPPED: 0, ERROR: 0 },
          },
        ],
        totalDurationMs: 100,
        testCount: {
          PASSED: 1,
          FAILED: 0,
          SKIPPED: 0,
          ERROR: 0,
        },
      },
      {
        id: 'FAILED',
        name: 'FAILED',
        children: [
          {
            id: '/test2/test2',
            name: 'test2',
            test: tests[1],
            testCount: { PASSED: 0, FAILED: 1, SKIPPED: 0, ERROR: 0 },
          },
        ],
        totalDurationMs: 100,
        testCount: {
          PASSED: 0,
          FAILED: 1,
          SKIPPED: 0,
          ERROR: 0,
        },
      },
      {
        id: 'SKIPPED',
        name: 'SKIPPED',
        children: [
          {
            id: '/test3/test3',
            name: 'test3',
            test: tests[2],
            testCount: { PASSED: 0, FAILED: 0, SKIPPED: 1, ERROR: 0 },
          },
        ],
        totalDurationMs: 100,
        testCount: {
          PASSED: 0,
          FAILED: 0,
          SKIPPED: 1,
          ERROR: 0,
        },
      },
      {
        id: 'ERROR',
        name: 'ERROR',
        children: [
          {
            id: '/test4/test4',
            name: 'test4',
            test: tests[3],
            testCount: { PASSED: 0, FAILED: 0, SKIPPED: 0, ERROR: 1 },
          },
        ],
        totalDurationMs: 100,
        testCount: {
          PASSED: 0,
          FAILED: 0,
          SKIPPED: 0,
          ERROR: 1,
        },
      },
    ];

    expect(result).toEqual(expectedResult);
  });

  it('should calculate total duration for status groups', () => {
    const tests: Test[] = [
      {
        name: 'test1',
        path: '/test1',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 1000 }],
      },
      {
        name: 'test2',
        path: '/test2',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 2000 }],
      },
      {
        name: 'test3',
        path: '/test3',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'FAILED', durationMs: 3000 }],
      },
    ];

    const result = strategy.buildTree(tests);

    const expectedSuccessGroup: TestTreeNode = {
      id: 'PASSED',
      name: 'PASSED',
      children: [
        {
          id: '/test1/test1',
          name: 'test1',
          test: tests[0],
          testCount: { PASSED: 1, FAILED: 0, SKIPPED: 0, ERROR: 0 },
        },
        {
          id: '/test2/test2',
          name: 'test2',
          test: tests[1],
          testCount: { PASSED: 1, FAILED: 0, SKIPPED: 0, ERROR: 0 },
        },
      ],
      totalDurationMs: 3000,
      testCount: {
        PASSED: 2,
        FAILED: 0,
        SKIPPED: 0,
        ERROR: 0,
      },
    };

    const expectedFailureGroup: TestTreeNode = {
      id: 'FAILED',
      name: 'FAILED',
      children: [
        {
          id: '/test3/test3',
          name: 'test3',
          test: tests[2],
          testCount: { PASSED: 0, FAILED: 1, SKIPPED: 0, ERROR: 0 },
        },
      ],
      totalDurationMs: 3000,
      testCount: {
        PASSED: 0,
        FAILED: 1,
        SKIPPED: 0,
        ERROR: 0,
      },
    };

    expect(result.find(n => n.name === 'PASSED')).toEqual(expectedSuccessGroup);
    expect(result.find(n => n.name === 'FAILED')).toEqual(expectedFailureGroup);
  });

  it('should sum durations across multiple tests in same group', () => {
    const tests: Test[] = [
      {
        name: 'test1',
        path: '/test1',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 500 }],
      },
      {
        name: 'test2',
        path: '/test2',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 750 }],
      },
      {
        name: 'test3',
        path: '/test3',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 250 }],
      },
    ];

    const result = strategy.buildTree(tests);

    const expectedGroup: TestTreeNode = {
      id: 'PASSED',
      name: 'PASSED',
      children: [
        {
          id: '/test1/test1',
          name: 'test1',
          test: tests[0],
          testCount: { PASSED: 1, FAILED: 0, SKIPPED: 0, ERROR: 0 },
        },
        {
          id: '/test2/test2',
          name: 'test2',
          test: tests[1],
          testCount: { PASSED: 1, FAILED: 0, SKIPPED: 0, ERROR: 0 },
        },
        {
          id: '/test3/test3',
          name: 'test3',
          test: tests[2],
          testCount: { PASSED: 1, FAILED: 0, SKIPPED: 0, ERROR: 0 },
        },
      ],
      totalDurationMs: 1500,
      testCount: {
        PASSED: 3,
        FAILED: 0,
        SKIPPED: 0,
        ERROR: 0,
      },
    };

    expect(result[0]).toEqual(expectedGroup);
  });

  it('should calculate test count for status groups', () => {
    const tests: Test[] = [
      {
        name: 'test1',
        path: '/test1',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 100 }],
      },
      {
        name: 'test2',
        path: '/test2',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 100 }],
      },
      {
        name: 'test3',
        path: '/test3',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'FAILED', durationMs: 100 }],
      },
    ];

    const result = strategy.buildTree(tests);

    const expectedSuccessGroup: TestTreeNode = {
      id: 'PASSED',
      name: 'PASSED',
      children: [
        {
          id: '/test1/test1',
          name: 'test1',
          test: tests[0],
          testCount: { PASSED: 1, FAILED: 0, SKIPPED: 0, ERROR: 0 },
        },
        {
          id: '/test2/test2',
          name: 'test2',
          test: tests[1],
          testCount: { PASSED: 1, FAILED: 0, SKIPPED: 0, ERROR: 0 },
        },
      ],
      totalDurationMs: 200,
      testCount: {
        PASSED: 2,
        FAILED: 0,
        SKIPPED: 0,
        ERROR: 0,
      },
    };

    const expectedFailureGroup: TestTreeNode = {
      id: 'FAILED',
      name: 'FAILED',
      children: [
        {
          id: '/test3/test3',
          name: 'test3',
          test: tests[2],
          testCount: { PASSED: 0, FAILED: 1, SKIPPED: 0, ERROR: 0 },
        },
      ],
      totalDurationMs: 100,
      testCount: {
        PASSED: 0,
        FAILED: 1,
        SKIPPED: 0,
        ERROR: 0,
      },
    };

    expect(result.find(n => n.name === 'PASSED')).toEqual(expectedSuccessGroup);
    expect(result.find(n => n.name === 'FAILED')).toEqual(expectedFailureGroup);
  });

  it('should sum test counts across multiple tests in same group', () => {
    const tests: Test[] = [
      {
        name: 'test1',
        path: '/test1',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 100 }],
      },
      {
        name: 'test2',
        path: '/test2',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 100 }],
      },
      {
        name: 'test3',
        path: '/test3',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 100 }],
      },
    ];

    const result = strategy.buildTree(tests);

    expect(result[0]).toEqual({
      id: 'PASSED',
      name: 'PASSED',
      children: [
        {
          id: '/test1/test1',
          name: 'test1',
          test: tests[0],
          testCount: { PASSED: 1, FAILED: 0, SKIPPED: 0, ERROR: 0 },
        },
        {
          id: '/test2/test2',
          name: 'test2',
          test: tests[1],
          testCount: { PASSED: 1, FAILED: 0, SKIPPED: 0, ERROR: 0 },
        },
        {
          id: '/test3/test3',
          name: 'test3',
          test: tests[2],
          testCount: { PASSED: 1, FAILED: 0, SKIPPED: 0, ERROR: 0 },
        },
      ],
      totalDurationMs: 300,
      testCount: {
        PASSED: 3,
        FAILED: 0,
        SKIPPED: 0,
        ERROR: 0,
      },
    });
  });
});
