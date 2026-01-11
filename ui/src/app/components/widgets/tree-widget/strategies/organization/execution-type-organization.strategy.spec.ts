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
      { name: 'test1', path: '/folder/test1', lastExecutionType: 'SUCCESS' },
      { name: 'test2', path: '/folder/test2', lastExecutionType: 'FAILURE' },
      { name: 'test3', path: '/folder/test3', lastExecutionType: 'SUCCESS' },
    ];

    const result = strategy.buildTree(tests);

    const expectedResult: TestTreeNode[] = [
      {
        id: 'SUCCESS',
        name: 'SUCCESS',
        children: [
          {
            id: '/folder/test1/test1',
            name: 'test1',
            test: tests[0],
            testCount: { SUCCESS: 1, FAILURE: 0, SKIPPED: 0, ERROR: 0 },
          },
          {
            id: '/folder/test3/test3',
            name: 'test3',
            test: tests[2],
            testCount: { SUCCESS: 1, FAILURE: 0, SKIPPED: 0, ERROR: 0 },
          },
        ],
        totalDurationMs: 0,
        testCount: {
          SUCCESS: 2,
          FAILURE: 0,
          SKIPPED: 0,
          ERROR: 0,
        },
      },
      {
        id: 'FAILURE',
        name: 'FAILURE',
        children: [
          {
            id: '/folder/test2/test2',
            name: 'test2',
            test: tests[1],
            testCount: { SUCCESS: 0, FAILURE: 1, SKIPPED: 0, ERROR: 0 },
          },
        ],
        totalDurationMs: 0,
        testCount: {
          SUCCESS: 0,
          FAILURE: 1,
          SKIPPED: 0,
          ERROR: 0,
        },
      },
    ];

    expect(result).toEqual(expectedResult);
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
    const expectedTestNode: TestTreeNode = {
      id: '/folder/test1/test1',
      name: 'test1',
      test: tests[0],
      testCount: { SUCCESS: 0, FAILURE: 1, SKIPPED: 0, ERROR: 0 },
    };

    expect(result[0].children?.[0]).toEqual(expectedTestNode);
  });

  it('should handle tests with different execution types', () => {
    const tests: Test[] = [
      { name: 'test1', path: '/test1', lastExecutionType: 'SUCCESS' },
      { name: 'test2', path: '/test2', lastExecutionType: 'FAILURE' },
      { name: 'test3', path: '/test3', lastExecutionType: 'SKIPPED' },
      { name: 'test4', path: '/test4', lastExecutionType: 'ERROR' },
    ];

    const result = strategy.buildTree(tests);

    const expectedResult: TestTreeNode[] = [
      {
        id: 'SUCCESS',
        name: 'SUCCESS',
        children: [
          {
            id: '/test1/test1',
            name: 'test1',
            test: tests[0],
            testCount: { SUCCESS: 1, FAILURE: 0, SKIPPED: 0, ERROR: 0 },
          },
        ],
        totalDurationMs: 0,
        testCount: {
          SUCCESS: 1,
          FAILURE: 0,
          SKIPPED: 0,
          ERROR: 0,
        },
      },
      {
        id: 'FAILURE',
        name: 'FAILURE',
        children: [
          {
            id: '/test2/test2',
            name: 'test2',
            test: tests[1],
            testCount: { SUCCESS: 0, FAILURE: 1, SKIPPED: 0, ERROR: 0 },
          },
        ],
        totalDurationMs: 0,
        testCount: {
          SUCCESS: 0,
          FAILURE: 1,
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
            testCount: { SUCCESS: 0, FAILURE: 0, SKIPPED: 1, ERROR: 0 },
          },
        ],
        totalDurationMs: 0,
        testCount: {
          SUCCESS: 0,
          FAILURE: 0,
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
            testCount: { SUCCESS: 0, FAILURE: 0, SKIPPED: 0, ERROR: 1 },
          },
        ],
        totalDurationMs: 0,
        testCount: {
          SUCCESS: 0,
          FAILURE: 0,
          SKIPPED: 0,
          ERROR: 1,
        },
      },
    ];

    expect(result).toEqual(expectedResult);
  });

  it('should calculate total duration for status groups', () => {
    const tests: Test[] = [
      { name: 'test1', path: '/test1', lastExecutionType: 'SUCCESS', durationMs: 1000 },
      { name: 'test2', path: '/test2', lastExecutionType: 'SUCCESS', durationMs: 2000 },
      { name: 'test3', path: '/test3', lastExecutionType: 'FAILURE', durationMs: 3000 },
    ];

    const result = strategy.buildTree(tests);

    const expectedSuccessGroup: TestTreeNode = {
      id: 'SUCCESS',
      name: 'SUCCESS',
      children: [
        {
          id: '/test1/test1',
          name: 'test1',
          test: tests[0],
          testCount: { SUCCESS: 1, FAILURE: 0, SKIPPED: 0, ERROR: 0 },
        },
        {
          id: '/test2/test2',
          name: 'test2',
          test: tests[1],
          testCount: { SUCCESS: 1, FAILURE: 0, SKIPPED: 0, ERROR: 0 },
        },
      ],
      totalDurationMs: 3000,
      testCount: {
        SUCCESS: 2,
        FAILURE: 0,
        SKIPPED: 0,
        ERROR: 0,
      },
    };

    const expectedFailureGroup: TestTreeNode = {
      id: 'FAILURE',
      name: 'FAILURE',
      children: [
        {
          id: '/test3/test3',
          name: 'test3',
          test: tests[2],
          testCount: { SUCCESS: 0, FAILURE: 1, SKIPPED: 0, ERROR: 0 },
        },
      ],
      totalDurationMs: 3000,
      testCount: {
        SUCCESS: 0,
        FAILURE: 1,
        SKIPPED: 0,
        ERROR: 0,
      },
    };

    expect(result.find(n => n.name === 'SUCCESS')).toEqual(expectedSuccessGroup);
    expect(result.find(n => n.name === 'FAILURE')).toEqual(expectedFailureGroup);
  });

  it('should sum durations across multiple tests in same group', () => {
    const tests: Test[] = [
      { name: 'test1', path: '/test1', lastExecutionType: 'SUCCESS', durationMs: 500 },
      { name: 'test2', path: '/test2', lastExecutionType: 'SUCCESS', durationMs: 750 },
      { name: 'test3', path: '/test3', lastExecutionType: 'SUCCESS', durationMs: 250 },
    ];

    const result = strategy.buildTree(tests);

    const expectedGroup: TestTreeNode = {
      id: 'SUCCESS',
      name: 'SUCCESS',
      children: [
        {
          id: '/test1/test1',
          name: 'test1',
          test: tests[0],
          testCount: { SUCCESS: 1, FAILURE: 0, SKIPPED: 0, ERROR: 0 },
        },
        {
          id: '/test2/test2',
          name: 'test2',
          test: tests[1],
          testCount: { SUCCESS: 1, FAILURE: 0, SKIPPED: 0, ERROR: 0 },
        },
        {
          id: '/test3/test3',
          name: 'test3',
          test: tests[2],
          testCount: { SUCCESS: 1, FAILURE: 0, SKIPPED: 0, ERROR: 0 },
        },
      ],
      totalDurationMs: 1500,
      testCount: {
        SUCCESS: 3,
        FAILURE: 0,
        SKIPPED: 0,
        ERROR: 0,
      },
    };

    expect(result[0]).toEqual(expectedGroup);
  });

  it('should calculate test count for status groups', () => {
    const tests: Test[] = [
      { name: 'test1', path: '/test1', lastExecutionType: 'SUCCESS' },
      { name: 'test2', path: '/test2', lastExecutionType: 'SUCCESS' },
      { name: 'test3', path: '/test3', lastExecutionType: 'FAILURE' },
    ];

    const result = strategy.buildTree(tests);

    const expectedSuccessGroup: TestTreeNode = {
      id: 'SUCCESS',
      name: 'SUCCESS',
      children: [
        {
          id: '/test1/test1',
          name: 'test1',
          test: tests[0],
          testCount: { SUCCESS: 1, FAILURE: 0, SKIPPED: 0, ERROR: 0 },
        },
        {
          id: '/test2/test2',
          name: 'test2',
          test: tests[1],
          testCount: { SUCCESS: 1, FAILURE: 0, SKIPPED: 0, ERROR: 0 },
        },
      ],
      totalDurationMs: 0,
      testCount: {
        SUCCESS: 2,
        FAILURE: 0,
        SKIPPED: 0,
        ERROR: 0,
      },
    };

    const expectedFailureGroup: TestTreeNode = {
      id: 'FAILURE',
      name: 'FAILURE',
      children: [
        {
          id: '/test3/test3',
          name: 'test3',
          test: tests[2],
          testCount: { SUCCESS: 0, FAILURE: 1, SKIPPED: 0, ERROR: 0 },
        },
      ],
      totalDurationMs: 0,
      testCount: {
        SUCCESS: 0,
        FAILURE: 1,
        SKIPPED: 0,
        ERROR: 0,
      },
    };

    expect(result.find(n => n.name === 'SUCCESS')).toEqual(expectedSuccessGroup);
    expect(result.find(n => n.name === 'FAILURE')).toEqual(expectedFailureGroup);
  });

  it('should sum test counts across multiple tests in same group', () => {
    const tests: Test[] = [
      { name: 'test1', path: '/test1', lastExecutionType: 'SUCCESS' },
      { name: 'test2', path: '/test2', lastExecutionType: 'SUCCESS' },
      { name: 'test3', path: '/test3', lastExecutionType: 'SUCCESS' },
    ];

    const result = strategy.buildTree(tests);

    expect(result[0]).toEqual({
      id: 'SUCCESS',
      name: 'SUCCESS',
      children: [
        {
          id: '/test1/test1',
          name: 'test1',
          test: tests[0],
          testCount: { SUCCESS: 1, FAILURE: 0, SKIPPED: 0, ERROR: 0 },
        },
        {
          id: '/test2/test2',
          name: 'test2',
          test: tests[1],
          testCount: { SUCCESS: 1, FAILURE: 0, SKIPPED: 0, ERROR: 0 },
        },
        {
          id: '/test3/test3',
          name: 'test3',
          test: tests[2],
          testCount: { SUCCESS: 1, FAILURE: 0, SKIPPED: 0, ERROR: 0 },
        },
      ],
      totalDurationMs: 0,
      testCount: {
        SUCCESS: 3,
        FAILURE: 0,
        SKIPPED: 0,
        ERROR: 0,
      },
    });
  });
});
