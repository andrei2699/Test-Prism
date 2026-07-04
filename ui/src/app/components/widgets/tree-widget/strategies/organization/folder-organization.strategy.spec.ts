import { FolderOrganizationStrategy } from './folder-organization.strategy';
import { Test } from '../../../../../types/TestReport';

describe('FolderOrganizationStrategy', () => {
  let strategy: FolderOrganizationStrategy;

  beforeEach(() => {
    strategy = new FolderOrganizationStrategy();
  });

  it('should return empty array for empty tests', () => {
    expect(strategy.buildTree([])).toEqual([]);
  });

  it('should handle single test without folder', () => {
    const tests: Test[] = [
      {
        name: 'test1',
        path: [],
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 100 }],
      },
    ];

    const result = strategy.buildTree(tests);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('test1');
    expect(result[0].test).toEqual(tests[0]);
    expect(result[0].testCount).toMatchObject({ PASSED: 1, FAILED: 0, SKIPPED: 0, ERROR: 0 });
  });

  it('should create folder hierarchy', () => {
    const tests: Test[] = [
      {
        name: 'test1',
        path: ['folder1', 'folder2', 'folder3'],
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 100 }],
      },
    ];

    const result = strategy.buildTree(tests);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('folder1');
    expect(result[0].children?.[0].name).toBe('folder2');
    expect(result[0].children?.[0].children?.[0].name).toBe('folder3');
    expect(result[0].children?.[0].children?.[0].children?.[0].name).toBe('test1');
  });

  it('should group tests under same folder', () => {
    const tests: Test[] = [
      {
        name: 'test1',
        path: ['folder'],
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 100 }],
      },
      {
        name: 'test2',
        path: ['folder'],
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'FAILED', durationMs: 100 }],
      },
    ];

    const result = strategy.buildTree(tests);

    expect(result[0].children).toHaveLength(2);
    expect(result[0].children?.[0].name).toBe('test1');
    expect(result[0].children?.[1].name).toBe('test2');
  });

  it('should handle multiple top-level folders', () => {
    const tests: Test[] = [
      {
        name: 'test1',
        path: ['folder1'],
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 100 }],
      },
      {
        name: 'test2',
        path: ['folder2'],
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 100 }],
      },
    ];

    const result = strategy.buildTree(tests);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('folder1');
    expect(result[1].name).toBe('folder2');
  });

  it('should preserve test metadata', () => {
    const tests: Test[] = [
      {
        name: 'test1',
        path: ['folder'],
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'ERROR', durationMs: 100 }],
      },
    ];

    const result = strategy.buildTree(tests);
    const testNode = result[0].children?.[0];

    expect(testNode?.test?.executions[0].status).toBe('ERROR');
    expect(testNode?.test?.path).toEqual(['folder']);
  });

  it('should maintain parent-child relationships', () => {
    const tests: Test[] = [
      {
        name: 'test1',
        path: ['a', 'b', 'c'],
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 100 }],
      },
      {
        name: 'test2',
        path: ['a', 'b'],
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 100 }],
      },
    ];

    const result = strategy.buildTree(tests);

    const folderA = result[0];
    const folderB = folderA.children?.[0];

    expect(folderB?.children).toHaveLength(2);
  });

  it('should calculate total duration for folders with single test', () => {
    const tests: Test[] = [
      {
        name: 'test1',
        path: ['folder'],
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 1500 }],
      },
    ];

    const result = strategy.buildTree(tests);

    expect(result[0].totalDurationMs).toBe(1500);
  });

  it('should sum durations for folders with multiple tests', () => {
    const tests: Test[] = [
      {
        name: 'test1',
        path: ['folder'],
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 1000 }],
      },
      {
        name: 'test2',
        path: ['folder'],
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 2000 }],
      },
      {
        name: 'test3',
        path: ['folder'],
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'FAILED', durationMs: 500 }],
      },
    ];

    const result = strategy.buildTree(tests);

    expect(result[0].totalDurationMs).toBe(3500);
  });

  it('should sum durations recursively for nested folders', () => {
    const tests: Test[] = [
      {
        name: 'test1',
        path: ['a', 'b'],
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 1000 }],
      },
      {
        name: 'test2',
        path: ['a', 'b'],
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 2000 }],
      },
      {
        name: 'test3',
        path: ['a', 'c'],
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 500 }],
      },
    ];

    const result = strategy.buildTree(tests);
    const folderA = result[0];

    expect(folderA.totalDurationMs).toBe(3500);
    expect(folderA.children?.[0].totalDurationMs).toBe(3000);
    expect(folderA.children?.[1].totalDurationMs).toBe(500);
  });

  it('should calculate test count for a single test', () => {
    const tests: Test[] = [
      {
        name: 'test1',
        path: [],
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 100 }],
      },
    ];

    const result = strategy.buildTree(tests);

    expect(result[0].testCount).toMatchObject({ PASSED: 1, FAILED: 0, SKIPPED: 0, ERROR: 0 });
  });

  it('should calculate test count for a folder with multiple tests', () => {
    const tests: Test[] = [
      {
        name: 'test1',
        path: ['folder'],
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 100 }],
      },
      {
        name: 'test2',
        path: ['folder'],
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'FAILED', durationMs: 100 }],
      },
    ];

    const result = strategy.buildTree(tests);

    expect(result[0].testCount).toMatchObject({ PASSED: 1, FAILED: 1, SKIPPED: 0, ERROR: 0 });
  });

  it('should calculate test count recursively for nested folders', () => {
    const tests: Test[] = [
      {
        name: 'test1',
        path: ['a', 'b'],
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 100 }],
      },
      {
        name: 'test2',
        path: ['a', 'b'],
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 100 }],
      },
      {
        name: 'test3',
        path: ['a', 'c'],
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 100 }],
      },
      {
        name: 'test4',
        path: ['a'],
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 100 }],
      },
    ];

    const result = strategy.buildTree(tests);
    const folderA = result[0];

    expect(folderA.testCount).toMatchObject({ PASSED: 4, FAILED: 0, SKIPPED: 0, ERROR: 0 });
    expect(folderA.children?.[0].testCount).toMatchObject({
      PASSED: 2,
      FAILED: 0,
      SKIPPED: 0,
      ERROR: 0,
    });
    expect(folderA.children?.[1].testCount).toMatchObject({
      PASSED: 1,
      FAILED: 0,
      SKIPPED: 0,
      ERROR: 0,
    });
  });

  it('should handle test with file property', () => {
    const tests: Test[] = [
      {
        name: 'test1',
        file: 'src/example.test.ts',
        path: ['describe1'],
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 100 }],
      },
    ];

    const result = strategy.buildTree(tests);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('example.test.ts');
    expect(result[0].icon).toBe('description');
    expect(result[0].children?.[0].name).toBe('describe1');
    expect(result[0].children?.[0].children?.[0].name).toBe('test1');
  });
});
