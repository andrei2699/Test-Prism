import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatTree } from '@angular/material/tree';
import { TestTree, TestTreeNode } from './test-tree';
import { TreeOrganizationStrategy } from '../strategies/organization/tree-organization-strategy.interface';
import { Test, TestExecutionType } from '../../../../types/TestReport';
import { TestFilterStrategy } from '../strategies/filter/test-filter-strategy.interface';
import { TreeSortStrategy } from '../strategies/sort/tree-sort-strategy.interface';
import { vi } from 'vitest';
import { TestColors } from '../../../../types/Layout';

const defaultTestCounts: Record<TestExecutionType, number> = {
  SUCCESS: 0,
  FAILURE: 0,
  SKIPPED: 0,
  ERROR: 0,
};

const createMockTreeOrganizationStrategy = (
  buildTreeResult: TestTreeNode[] = [],
  name: string = 'mock',
  icon: string = 'folder',
  color: string = 'inherit',
): TreeOrganizationStrategy => ({
  buildTree: vi.fn().mockReturnValue(
    buildTreeResult.map(node => {
      if (node.children && node.children.length > 0 && node.testCount === undefined) {
        return { ...node, testCount: { ...defaultTestCounts } };
      }
      return node;
    }),
  ),
  getName: vi.fn().mockReturnValue(name),
  getIcon: vi.fn().mockReturnValue(icon),
  getColor: vi.fn().mockReturnValue(color),
});

const createMockTestFilterStrategy = (filterResult: Test[] = []): TestFilterStrategy => ({
  filter: vi.fn().mockReturnValue(filterResult),
});

describe('TestTree Component', () => {
  let component: TestTree;
  let fixture: ComponentFixture<TestTree>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestTree],
    }).compileComponents();

    fixture = TestBed.createComponent(TestTree);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('tests', []);
    fixture.componentRef.setInput('filterStrategy', null);
    fixture.componentRef.setInput('strategy', createMockTreeOrganizationStrategy());
    fixture.componentRef.setInput('sortStrategies', []);
    fixture.componentRef.setInput('colors', {
      SUCCESS: 'green',
      FAILURE: 'red',
      SKIPPED: 'yellow',
      ERROR: 'orange',
    } satisfies TestColors);
    fixture.componentRef.setInput('selectedTest', null);
  });

  describe('dataSource Computed Signal', () => {
    it('should return empty array for empty tests', () => {
      fixture.componentRef.setInput('tests', []);
      fixture.detectChanges();

      expect(component.dataSource()).toEqual([]);
    });

    it('should call strategy buildTree with tests', () => {
      const tests: Test[] = [
        {
          name: 'test1',
          path: '/folder/test1',
          executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 1000 }],
        },
      ];

      const mockStrategy = createMockTreeOrganizationStrategy([]);

      fixture.componentRef.setInput('tests', tests);
      fixture.componentRef.setInput('strategy', mockStrategy);
      fixture.detectChanges();

      component.dataSource();

      expect(mockStrategy.buildTree).toHaveBeenCalledWith(tests);
    });

    it('should return result from strategy buildTree', () => {
      const tests: Test[] = [
        {
          name: 'test1',
          path: '/folder/test1',
          executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 1000 }],
        },
      ];

      const expectedResult: TestTreeNode[] = [
        {
          id: 'folder',
          name: 'folder',
          children: [{ id: 'test1', name: 'test1' }],
          testCount: { SUCCESS: 1, FAILURE: 0, SKIPPED: 0, ERROR: 0 },
        },
      ];

      const mockStrategy = createMockTreeOrganizationStrategy(expectedResult);

      fixture.componentRef.setInput('tests', tests);
      fixture.componentRef.setInput('strategy', mockStrategy);
      fixture.detectChanges();

      const result = component.dataSource();

      expect(result).toEqual(expectedResult);
    });

    it('should recalculate when tests change', () => {
      const tests1: Test[] = [
        {
          name: 'test1',
          path: '/folder/test1',
          executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 1000 }],
        },
      ];

      const mockStrategy = createMockTreeOrganizationStrategy([]);

      fixture.componentRef.setInput('tests', tests1);
      fixture.componentRef.setInput('strategy', mockStrategy);
      fixture.detectChanges();

      component.dataSource();
      expect(mockStrategy.buildTree).toHaveBeenCalledTimes(1);

      const tests2: Test[] = [
        {
          name: 'test1',
          path: '/folder/test1',
          executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 1000 }],
        },
        {
          name: 'test2',
          path: '/folder/test2',
          executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'FAILURE', durationMs: 2000 }],
        },
      ];

      fixture.componentRef.setInput('tests', tests2);
      fixture.detectChanges();

      component.dataSource();
      expect(mockStrategy.buildTree).toHaveBeenCalledTimes(2);
    });

    it('should recalculate when strategy changes', () => {
      const tests: Test[] = [
        {
          name: 'test1',
          path: '/folder/test1',
          executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 1000 }],
        },
      ];

      const strategy1 = createMockTreeOrganizationStrategy([
        {
          id: 'result1',
          name: 'result1',
          test: {
            name: 'test1',
            path: '/folder/test1',
            executions: [
              { timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 1000 },
            ],
          },
          testCount: { SUCCESS: 1, FAILURE: 0, SKIPPED: 0, ERROR: 0 },
        },
      ]);

      fixture.componentRef.setInput('tests', tests);
      fixture.componentRef.setInput('strategy', strategy1);
      fixture.detectChanges();

      let result = component.dataSource();
      expect(result[0].name).toBe('result1');

      const strategy2 = createMockTreeOrganizationStrategy([
        {
          id: 'result2',
          name: 'result2',
          test: {
            name: 'test1',
            path: '/folder/test1',
            executions: [
              { timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 1000 },
            ],
          },
          testCount: { SUCCESS: 1, FAILURE: 0, SKIPPED: 0, ERROR: 0 },
        },
      ]);

      fixture.componentRef.setInput('strategy', strategy2);
      fixture.detectChanges();

      result = component.dataSource();
      expect(result[0].name).toBe('result2');
    });
  });

  describe('childrenAccessor', () => {
    it('should return empty array when children is undefined', () => {
      const node: TestTreeNode = { id: 'test', name: 'test' };
      expect(component.childrenAccessor(node)).toEqual([]);
    });

    it('should return children array when children exists', () => {
      const children: TestTreeNode[] = [
        { id: 'child1', name: 'child1' },
        { id: 'child2', name: 'child2' },
      ];
      const node: TestTreeNode = { id: 'parent', name: 'parent', children };

      expect(component.childrenAccessor(node)).toEqual(children);
    });

    it('should return empty array for empty children', () => {
      const node: TestTreeNode = { id: 'parent', name: 'parent', children: [] };
      expect(component.childrenAccessor(node)).toEqual([]);
    });

    it('should work with single child', () => {
      const node: TestTreeNode = {
        id: 'parent',
        name: 'parent',
        children: [{ id: 'child', name: 'child' }],
      };

      expect(component.childrenAccessor(node)).toHaveLength(1);
      expect(component.childrenAccessor(node)[0].name).toBe('child');
    });
  });

  describe('hasChild', () => {
    it('should return false when children is undefined', () => {
      const node: TestTreeNode = { id: 'test', name: 'test' };
      expect(component.hasChild(0, node)).toBe(false);
    });

    it('should return false when children is empty array', () => {
      const node: TestTreeNode = { id: 'parent', name: 'parent', children: [] };
      expect(component.hasChild(0, node)).toBe(false);
    });

    it('should return true when children exists with items', () => {
      const node: TestTreeNode = {
        id: 'parent',
        name: 'parent',
        children: [{ id: 'child', name: 'child' }],
      };

      expect(component.hasChild(0, node)).toBe(true);
    });

    it('should return true with multiple children', () => {
      const node: TestTreeNode = {
        id: 'parent',
        name: 'parent',
        children: [
          { id: 'child1', name: 'child1' },
          { id: 'child2', name: 'child2' },
          { id: 'child3', name: 'child3' },
        ],
      };

      expect(component.hasChild(0, node)).toBe(true);
    });

    it('should ignore index parameter value', () => {
      const node: TestTreeNode = {
        id: 'parent',
        name: 'parent',
        children: [{ id: 'child', name: 'child' }],
      };

      expect(component.hasChild(0, node)).toBe(component.hasChild(999, node));
    });
  });

  describe('TestTreeNode Interface', () => {
    it('should support name property', () => {
      const node: TestTreeNode = { id: 'test', name: 'test' };
      expect(node.name).toBe('test');
    });

    it('should support optional test property', () => {
      const test: Test = {
        name: 'test1',
        path: '/test1',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 1500 }],
      };

      const node: TestTreeNode = { id: 'test1', name: 'test1', test };
      expect(node.test).toEqual(test);
    });

    it('should support optional children property', () => {
      const children: TestTreeNode[] = [{ id: 'child', name: 'child' }];
      const node: TestTreeNode = { id: 'parent', name: 'parent', children };

      expect(node.children).toEqual(children);
    });

    it('should allow test without children', () => {
      const test: Test = {
        name: 'test1',
        path: '/test1',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 2000 }],
      };

      const node: TestTreeNode = { id: 'test1', name: 'test1', test };
      expect(node.test).toBeDefined();
      expect(node.children).toBeUndefined();
    });

    it('should allow folder without test', () => {
      const node: TestTreeNode = {
        id: 'folder',
        name: 'folder',
        children: [{ id: 'test', name: 'test' }],
        testCount: { ...defaultTestCounts },
      };

      expect(node.test).toBeUndefined();
      expect(node.children).toBeDefined();
    });
  });

  describe('TestTreeNode Interface - Duration', () => {
    it('should support optional durationMs on test', () => {
      const test: Test = {
        name: 'test1',
        path: '/test1',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 1500 }],
      };

      const node: TestTreeNode = { id: 'test1', name: 'test1', test };
      expect(node.test?.executions[0].durationMs).toBe(1500);
    });

    it('should support optional totalDurationMs on group', () => {
      const node: TestTreeNode = {
        id: 'folder',
        name: 'folder',
        children: [],
        totalDurationMs: 5000,
      };

      expect(node.totalDurationMs).toBe(5000);
    });

    it('should allow nodes without duration', () => {
      const node: TestTreeNode = { id: 'test', name: 'test' };
      expect(node.totalDurationMs).toBeUndefined();
    });
  });

  describe('filteredTests Computed Signal', () => {
    it('should return all tests when no filter strategy is provided', () => {
      const tests: Test[] = [
        {
          name: 'test1',
          path: '/test1',
          executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        },
        {
          name: 'test2',
          path: '/test2',
          executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'FAILURE', durationMs: 100 }],
        },
      ];

      fixture.componentRef.setInput('tests', tests);
      fixture.componentRef.setInput('filterStrategy', null);
      fixture.detectChanges();

      expect(component.filteredTests()).toEqual(tests);
    });

    it('should apply filter strategy when provided', () => {
      const tests: Test[] = [
        {
          name: 'test1',
          path: '/test1',
          executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        },
        {
          name: 'test2',
          path: '/test2',
          executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'FAILURE', durationMs: 100 }],
        },
      ];

      const mockFilter = createMockTestFilterStrategy([tests[0]]);

      fixture.componentRef.setInput('tests', tests);
      fixture.componentRef.setInput('filterStrategy', mockFilter);
      fixture.detectChanges();

      expect(component.filteredTests()).toEqual([tests[0]]);
      expect(mockFilter.filter).toHaveBeenCalledWith(tests);
    });

    it('should recalculate when filter strategy changes', () => {
      const tests: Test[] = [
        {
          name: 'test1',
          path: '/test1',
          executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        },
        {
          name: 'test2',
          path: '/test2',
          executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'FAILURE', durationMs: 100 }],
        },
      ];

      const filter1 = createMockTestFilterStrategy([tests[0]]);

      fixture.componentRef.setInput('tests', tests);
      fixture.componentRef.setInput('filterStrategy', filter1);
      fixture.detectChanges();

      component.filteredTests();
      expect(filter1.filter).toHaveBeenCalledTimes(1);

      const filter2 = createMockTestFilterStrategy([tests[1]]);

      fixture.componentRef.setInput('filterStrategy', filter2);
      fixture.detectChanges();

      expect(component.filteredTests()).toEqual([tests[1]]);
      expect(filter2.filter).toHaveBeenCalledTimes(1);
    });
  });

  describe('dataSource with Sorting', () => {
    it('should apply sort strategies to tree nodes', () => {
      const tests: Test[] = [
        {
          name: 'test1',
          path: '/folder/test1',
          executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        },
      ];

      const mockSort: TreeSortStrategy = {
        sort: vi
          .fn()
          .mockReturnValue([
            { id: 'sorted', name: 'sorted', children: [], testCount: { ...defaultTestCounts } },
          ]),
      };

      const mockStrategy = createMockTreeOrganizationStrategy([
        { id: 'unsorted', name: 'unsorted', children: [], testCount: { ...defaultTestCounts } },
      ]);

      fixture.componentRef.setInput('tests', tests);
      fixture.componentRef.setInput('strategy', mockStrategy);
      fixture.componentRef.setInput('sortStrategies', [mockSort]);

      const result = component.dataSource();

      expect(mockSort.sort).toHaveBeenCalled();
      expect(result[0].name).toBe('sorted');
    });

    it('should apply multiple sort strategies in order', () => {
      const tests: Test[] = [
        {
          name: 'test1',
          path: '/folder/test1',
          executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        },
      ];

      const mockSort1: TreeSortStrategy = {
        sort: vi
          .fn()
          .mockImplementation((nodes: TestTreeNode[]) => [
            ...nodes.map(n => ({ ...n, name: n.name + '1' })),
          ]),
      };

      const mockSort2: TreeSortStrategy = {
        sort: vi
          .fn()
          .mockImplementation((nodes: TestTreeNode[]) => [
            ...nodes.map(n => ({ ...n, name: n.name + '2' })),
          ]),
      };

      const mockStrategy = createMockTreeOrganizationStrategy([
        { id: 'test', name: 'test', children: [], testCount: { ...defaultTestCounts } },
      ]);

      fixture.componentRef.setInput('tests', tests);
      fixture.componentRef.setInput('strategy', mockStrategy);
      fixture.componentRef.setInput('sortStrategies', [mockSort1, mockSort2]);

      const result = component.dataSource();

      expect(mockSort1.sort).toHaveBeenCalled();
      expect(mockSort2.sort).toHaveBeenCalled();
      expect(result[0].name).toBe('test12');
    });

    it('should handle empty sort strategies array', () => {
      const tests: Test[] = [
        {
          name: 'test1',
          path: '/folder/test1',
          executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        },
      ];

      const expectedNodes: TestTreeNode[] = [
        { id: 'test1', name: 'test1', children: [], testCount: { ...defaultTestCounts } },
      ];

      const mockStrategy = createMockTreeOrganizationStrategy(expectedNodes);

      fixture.componentRef.setInput('tests', tests);
      fixture.componentRef.setInput('strategy', mockStrategy);
      fixture.componentRef.setInput('sortStrategies', []);

      const result = component.dataSource();

      expect(result).toEqual(expectedNodes);
    });
  });

  describe('dataSource with Filtering and Sorting', () => {
    it('should apply filtering before building tree', () => {
      const tests: Test[] = [
        {
          name: 'test1',
          path: '/folder/test1',
          executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        },
        {
          name: 'test2',
          path: '/folder/test2',
          executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'FAILURE', durationMs: 100 }],
        },
      ];

      const filteredTests: Test[] = [tests[0]];

      const mockFilter = createMockTestFilterStrategy(filteredTests);

      const mockStrategy = createMockTreeOrganizationStrategy([
        { id: 'test1', name: 'test1', testCount: { ...defaultTestCounts } },
      ]);

      fixture.componentRef.setInput('tests', tests);
      fixture.componentRef.setInput('filterStrategy', mockFilter);
      fixture.componentRef.setInput('strategy', mockStrategy);
      fixture.componentRef.setInput('sortStrategies', []);

      component.dataSource();

      expect(mockStrategy.buildTree).toHaveBeenCalledWith(filteredTests);
    });

    it('should apply sorting after building tree with filtered tests', () => {
      const tests: Test[] = [
        {
          name: 'test1',
          path: '/folder/test1',
          executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        },
        {
          name: 'test2',
          path: '/folder/test2',
          executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'FAILURE', durationMs: 100 }],
        },
      ];

      const filteredTests: Test[] = [tests[0]];

      const mockFilter = createMockTestFilterStrategy(filteredTests);

      const mockSort: TreeSortStrategy = {
        sort: vi
          .fn()
          .mockReturnValue([
            { id: 'sorted', name: 'sorted', children: [], testCount: { ...defaultTestCounts } },
          ]),
      };

      const mockStrategy = createMockTreeOrganizationStrategy([
        { id: 'unsorted', name: 'unsorted', children: [], testCount: { ...defaultTestCounts } },
      ]);

      fixture.componentRef.setInput('tests', tests);
      fixture.componentRef.setInput('filterStrategy', mockFilter);
      fixture.componentRef.setInput('strategy', mockStrategy);
      fixture.componentRef.setInput('sortStrategies', [mockSort]);

      const result = component.dataSource();

      expect(mockFilter.filter).toHaveBeenCalledWith(tests);
      expect(mockStrategy.buildTree).toHaveBeenCalledWith(filteredTests);
      expect(mockSort.sort).toHaveBeenCalled();
      expect(result[0].name).toBe('sorted');
    });
  });

  describe('No tests message', () => {
    it('should display "No tests to display." when dataSource is empty', () => {
      fixture.componentRef.setInput('tests', []);
      fixture.detectChanges();

      const noTestsMessage = fixture.nativeElement.querySelector('.no-tests-message');
      expect(noTestsMessage).toBeTruthy();
      expect(noTestsMessage.textContent).toContain('No tests to display.');
    });

    it('should not display "No tests to display." when dataSource has items', () => {
      const tests: Test[] = [
        {
          name: 'test1',
          path: '/folder/test1',
          executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        },
      ];
      const mockStrategy = createMockTreeOrganizationStrategy([
        { id: 'test1', name: 'test1', children: [], testCount: { ...defaultTestCounts } },
      ]);

      fixture.componentRef.setInput('tests', tests);
      fixture.componentRef.setInput('strategy', mockStrategy);
      fixture.detectChanges();

      const noTestsMessage = fixture.nativeElement.querySelector('.no-tests-message');
      expect(noTestsMessage).toBeFalsy();
    });
  });

  describe('onNodeClick', () => {
    it('should emit testSelected when node has a test', () => {
      const test: Test = {
        name: 'test1',
        path: '/test1',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 1500 }],
      };
      const node: TestTreeNode = { id: 'test1', name: 'test1', test };
      const spy = vi.fn();
      component.testSelected.subscribe(spy);

      component.onNodeClick(node);

      expect(spy).toHaveBeenCalledWith(test);
    });

    it('should not emit testSelected when node does not have a test', () => {
      const node: TestTreeNode = { id: 'folder', name: 'folder' };
      const spy = vi.fn();
      component.testSelected.subscribe(spy);

      component.onNodeClick(node);

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('isNodeSelected', () => {
    it('should return true if node test matches selected test', () => {
      const test: Test = {
        name: 'test1',
        path: '/test1',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 1500 }],
      };
      const node: TestTreeNode = { id: 'test1', name: 'test1', test };
      fixture.componentRef.setInput('selectedTest', test);
      fixture.detectChanges();

      expect(component.isNodeSelected(node)).toBe(true);
    });

    it('should return false if node test does not match selected test', () => {
      const test1: Test = {
        name: 'test1',
        path: '/test1',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 1500 }],
      };
      const test2: Test = {
        name: 'test2',
        path: '/test2',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'FAILURE', durationMs: 2000 }],
      };
      const node: TestTreeNode = { id: 'test1', name: 'test1', test: test1 };
      fixture.componentRef.setInput('selectedTest', test2);
      fixture.detectChanges();

      expect(component.isNodeSelected(node)).toBe(false);
    });

    it('should return false if node has no test', () => {
      const test: Test = {
        name: 'test1',
        path: '/test1',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 1500 }],
      };
      const node: TestTreeNode = { id: 'folder', name: 'folder' };
      fixture.componentRef.setInput('selectedTest', test);
      fixture.detectChanges();

      expect(component.isNodeSelected(node)).toBe(false);
    });
  });

  describe('Expansion state', () => {
    it('should preserve expanded nodes on data source change', () => {
      const nodes: TestTreeNode[] = [
        {
          id: 'folder',
          name: 'folder',
          children: [
            {
              id: 'test1',
              name: 'test1',
              test: {
                name: 'test1',
                path: '/folder/test1',
                executions: [
                  { timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 },
                ],
              },
            },
          ],
        },
      ];
      const mockStrategy = createMockTreeOrganizationStrategy(nodes);
      fixture.componentRef.setInput('strategy', mockStrategy);
      fixture.detectChanges();

      const expandableNode = component.dataSource()[0];

      const treeDebugElement = fixture.debugElement.query(By.directive(MatTree));
      const tree = treeDebugElement.componentInstance as MatTree<TestTreeNode>;

      tree.expand(expandableNode);
      expect(tree.isExpanded(expandableNode)).toBe(true);

      const newNodes: TestTreeNode[] = [
        {
          id: 'folder',
          name: 'folder',
          children: [
            {
              id: 'test1',
              name: 'test1',
              test: {
                name: 'test1',
                path: '/folder/test1',
                executions: [
                  { timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 },
                ],
              },
            },
          ],
        },
        {
          id: 'folder2',
          name: 'folder2',
          children: [
            {
              id: 'test2',
              name: 'test2',
              test: {
                name: 'test2',
                path: '/folder2/test2',
                executions: [
                  { timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 },
                ],
              },
            },
          ],
        },
      ];
      const newMockStrategy = createMockTreeOrganizationStrategy(newNodes);
      fixture.componentRef.setInput('strategy', newMockStrategy);
      fixture.detectChanges();

      const newExpandableNode = component.dataSource().find(n => n.id === 'folder');
      expect(newExpandableNode).toBeDefined();
      expect(tree.isExpanded(newExpandableNode!)).toBe(true);
    });
  });
});
