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
