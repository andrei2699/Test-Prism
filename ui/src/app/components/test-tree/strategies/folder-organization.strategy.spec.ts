import { FolderOrganizationStrategy } from './folder-organization.strategy';
import { Test } from '../../../types/TestReport';

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
        path: '/test1',
        lastExecutionType: 'SUCCESS',
      },
    ];

    const result = strategy.buildTree(tests);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('test1');
    expect(result[0].test).toEqual(tests[0]);
    expect(result[0].testCount).toBeUndefined();
  });

  it('should create folder hierarchy', () => {
    const tests: Test[] = [
      {
        name: 'test1',
        path: '/folder1/folder2/folder3/test1',
        lastExecutionType: 'SUCCESS',
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
      { name: 'test1', path: '/folder/test1', lastExecutionType: 'SUCCESS' },
      { name: 'test2', path: '/folder/test2', lastExecutionType: 'FAILURE' },
    ];

    const result = strategy.buildTree(tests);

    expect(result[0].children).toHaveLength(2);
    expect(result[0].children?.[0].name).toBe('test1');
    expect(result[0].children?.[1].name).toBe('test2');
  });

  it('should handle multiple top-level folders', () => {
    const tests: Test[] = [
      { name: 'test1', path: '/folder1/test1', lastExecutionType: 'SUCCESS' },
      { name: 'test2', path: '/folder2/test2', lastExecutionType: 'SUCCESS' },
    ];

    const result = strategy.buildTree(tests);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('folder1');
    expect(result[1].name).toBe('folder2');
  });

  it('should preserve test metadata', () => {
    const tests: Test[] = [{ name: 'test1', path: '/folder/test1', lastExecutionType: 'ERROR' }];

    const result = strategy.buildTree(tests);
    const testNode = result[0].children?.[0];

    expect(testNode?.test?.lastExecutionType).toBe('ERROR');
    expect(testNode?.test?.path).toBe('/folder/test1');
  });

  it('should handle paths with trailing slashes', () => {
    const tests: Test[] = [{ name: 'test1', path: '/folder//test1', lastExecutionType: 'SUCCESS' }];

    const result = strategy.buildTree(tests);

    expect(result[0].children?.[0].name).toBe('test1');
  });

  it('should maintain parent-child relationships', () => {
    const tests: Test[] = [
      { name: 'test1', path: '/a/b/c/test1', lastExecutionType: 'SUCCESS' },
      { name: 'test2', path: '/a/b/test2', lastExecutionType: 'SUCCESS' },
    ];

    const result = strategy.buildTree(tests);

    const folderA = result[0];
    const folderB = folderA.children?.[0];

    expect(folderB?.children).toHaveLength(2);
  });

  it('should calculate total duration for folders with single test', () => {
    const tests: Test[] = [
      { name: 'test1', path: '/folder/test1', lastExecutionType: 'SUCCESS', durationMs: 1500 },
    ];

    const result = strategy.buildTree(tests);

    expect(result[0].totalDurationMs).toBe(1500);
  });

  it('should sum durations for folders with multiple tests', () => {
    const tests: Test[] = [
      { name: 'test1', path: '/folder/test1', lastExecutionType: 'SUCCESS', durationMs: 1000 },
      { name: 'test2', path: '/folder/test2', lastExecutionType: 'SUCCESS', durationMs: 2000 },
      { name: 'test3', path: '/folder/test3', lastExecutionType: 'FAILURE', durationMs: 500 },
    ];

    const result = strategy.buildTree(tests);

    expect(result[0].totalDurationMs).toBe(3500);
  });

  it('should sum durations recursively for nested folders', () => {
    const tests: Test[] = [
      { name: 'test1', path: '/a/b/test1', lastExecutionType: 'SUCCESS', durationMs: 1000 },
      { name: 'test2', path: '/a/b/test2', lastExecutionType: 'SUCCESS', durationMs: 2000 },
      { name: 'test3', path: '/a/c/test3', lastExecutionType: 'SUCCESS', durationMs: 500 },
    ];

    const result = strategy.buildTree(tests);
    const folderA = result[0];

    expect(folderA.totalDurationMs).toBe(3500);
    expect(folderA.children?.[0].totalDurationMs).toBe(3000);
    expect(folderA.children?.[1].totalDurationMs).toBe(500);
  });

  it('should handle tests without duration', () => {
    const tests: Test[] = [
      { name: 'test1', path: '/folder/test1', lastExecutionType: 'SUCCESS' },
      { name: 'test2', path: '/folder/test2', lastExecutionType: 'SUCCESS', durationMs: 2000 },
    ];

    const result = strategy.buildTree(tests);

    expect(result[0].totalDurationMs).toBe(2000);
  });

  it('should calculate test count for a single test', () => {
    const tests: Test[] = [{ name: 'test1', path: '/test1', lastExecutionType: 'SUCCESS' }];

    const result = strategy.buildTree(tests);

    expect(result[0].testCount).toBeUndefined(); // Test nodes don't have testCount
  });

  it('should calculate test count for a folder with multiple tests', () => {
    const tests: Test[] = [
      { name: 'test1', path: '/folder/test1', lastExecutionType: 'SUCCESS' },
      { name: 'test2', path: '/folder/test2', lastExecutionType: 'FAILURE' },
    ];

    const result = strategy.buildTree(tests);

    expect(result[0].testCount).toBe(2);
  });

  it('should calculate test count recursively for nested folders', () => {
    const tests: Test[] = [
      { name: 'test1', path: '/a/b/test1', lastExecutionType: 'SUCCESS' },
      { name: 'test2', path: '/a/b/test2', lastExecutionType: 'SUCCESS' },
      { name: 'test3', path: '/a/c/test3', lastExecutionType: 'SUCCESS' },
      { name: 'test4', path: '/a/test4', lastExecutionType: 'SUCCESS' },
    ];

    const result = strategy.buildTree(tests);
    const folderA = result[0];

    expect(folderA.testCount).toBe(4);
    expect(folderA.children?.[0].testCount).toBe(2); // folder b
    expect(folderA.children?.[1].testCount).toBe(1); // folder c
  });

  it('should calculate test count for mixed content (tests and subfolders)', () => {
    const tests: Test[] = [
      { name: 'test1', path: '/folder1/subfolder/test1', lastExecutionType: 'SUCCESS' },
      { name: 'test2', path: '/folder1/test2', lastExecutionType: 'SUCCESS' },
    ];

    const result = strategy.buildTree(tests);
    const folder1 = result[0];

    expect(folder1.testCount).toBe(2);
    expect(folder1.children?.[0].testCount).toBe(1); // subfolder
  });
});
