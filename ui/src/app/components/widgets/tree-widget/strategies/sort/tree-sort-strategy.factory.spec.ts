import { describe, expect, it } from 'vitest';
import { TreeSortStrategyFactory } from './tree-sort-strategy.factory';
import { TestTreeNode } from '../../test-tree/test-tree';

describe('TreeSortStrategyFactory', () => {
  it('should create a name sort strategy', () => {
    const strategy = TreeSortStrategyFactory.create('name');
    expect(strategy).toBeDefined();
  });

  it('should throw error for unknown sort strategy', () => {
    expect(() => TreeSortStrategyFactory.create('unknown')).toThrow();
  });
});

describe('NameSortStrategy', () => {
  it('should sort nodes alphabetically by name', () => {
    const strategy = TreeSortStrategyFactory.create('name');
    const unsortedNodes: TestTreeNode[] = [
      { id: 'Zebra', name: 'Zebra', children: [] },
      { id: 'Apple', name: 'Apple', children: [] },
      { id: 'Mango', name: 'Mango', children: [] },
    ];

    const sorted = strategy.sort(unsortedNodes);

    expect(sorted[0].name).toBe('Apple');
    expect(sorted[1].name).toBe('Mango');
    expect(sorted[2].name).toBe('Zebra');
  });

  it('should recursively sort child nodes', () => {
    const strategy = TreeSortStrategyFactory.create('name');
    const nodes: TestTreeNode[] = [
      {
        id: 'Parent',
        name: 'Parent',
        children: [
          {
            id: 'Zebra',
            name: 'Zebra',
          },
          {
            id: 'Apply',
            name: 'Apple',
          },
          {
            id: 'Mango',
            name: 'Mango',
          },
        ],
      },
    ];

    const sorted = strategy.sort(nodes);

    expect(sorted[0].children?.[0].name).toBe('Apple');
    expect(sorted[0].children?.[1].name).toBe('Mango');
    expect(sorted[0].children?.[2].name).toBe('Zebra');
  });

  it('should handle nodes without children', () => {
    const strategy = TreeSortStrategyFactory.create('name');
    const nodes: TestTreeNode[] = [
      {
        id: 'Zebra',
        name: 'Zebra',
      },
      {
        id: 'Apple',
        name: 'Apple',
      },
    ];

    const sorted = strategy.sort(nodes);

    expect(sorted[0].name).toBe('Apple');
    expect(sorted[1].name).toBe('Zebra');
    expect(sorted[0].children).toBeUndefined();
  });
});

describe('FolderSortStrategy', () => {
  it('should create a folder sort strategy in factory', () => {
    const strategy = TreeSortStrategyFactory.create('folder');
    expect(strategy).toBeDefined();
  });

  it('should sort folders before tests', () => {
    const strategy = TreeSortStrategyFactory.create('folder');
    const unsortedNodes: TestTreeNode[] = [
      {
        id: 'test1',
        name: 'test1',
        test: { name: 'test1', path: 'path', executions: [], tags: [] },
      },
      { id: 'folder1', name: 'folder1', children: [] },
      {
        id: 'test2',
        name: 'test2',
        test: { name: 'test2', path: 'path', executions: [], tags: [] },
      },
      { id: 'folder2', name: 'folder2', children: [] },
    ];

    const sorted = strategy.sort(unsortedNodes);

    expect(sorted[0].id).toBe('folder1');
    expect(sorted[1].id).toBe('folder2');
    expect(sorted[2].id).toBe('test1');
    expect(sorted[3].id).toBe('test2');
  });

  it('should recursively sort children', () => {
    const strategy = TreeSortStrategyFactory.create('folder');
    const nodes: TestTreeNode[] = [
      {
        id: 'parent',
        name: 'parent',
        children: [
          {
            id: 'childTest',
            name: 'childTest',
            test: { name: 'childTest', path: 'path', executions: [], tags: [] },
          },
          { id: 'childFolder', name: 'childFolder', children: [] },
        ],
      },
    ];

    const sorted = strategy.sort(nodes);

    expect(sorted[0].children?.[0].id).toBe('childFolder');
    expect(sorted[0].children?.[1].id).toBe('childTest');
  });
});
