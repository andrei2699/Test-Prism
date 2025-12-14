import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestTree, TestTreeNode } from './test-tree';
import { FolderOrganizationStrategy } from './strategies/organization/folder-organization.strategy';
import { TreeOrganizationStrategy } from './strategies/organization/tree-organization-strategy.interface';
import { Test, TestExecutionType } from '../../types/TestReport';
import { TestFilterStrategy } from './strategies/filter/test-filter-strategy.interface';
import { TreeSortStrategy } from './strategies/sort/tree-sort-strategy.interface';
import { vi } from 'vitest';

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
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have tests input', () => {
      expect(component.tests).toBeDefined();
    });

    it('should have strategy computed signal', () => {
      expect(component.strategy).toBeDefined();
    });

    it('should have dataSource computed signal', () => {
      expect(component.dataSource).toBeDefined();
    });
  });

  describe('strategy Computed Signal', () => {
    it('should return FolderOrganizationStrategy by default', () => {
      fixture.componentRef.setInput('tests', []);
      fixture.detectChanges();
      expect(component.strategy()).toBeInstanceOf(FolderOrganizationStrategy);
    });

    it('should accept strategy instance', () => {
      const customStrategy = new FolderOrganizationStrategy();
      fixture.componentRef.setInput('tests', []);
      fixture.componentRef.setInput('strategy', customStrategy);
      fixture.detectChanges();

      expect(component.strategy()).toBe(customStrategy);
    });
  });

  describe('dataSource Computed Signal', () => {
    it('should return empty array for empty tests', () => {
      fixture.componentRef.setInput('tests', []);
      fixture.detectChanges();

      expect(component.dataSource()).toEqual([]);
    });

    it('should call strategy buildTree with tests', () => {
      const tests: Test[] = [
        { name: 'test1', path: '/folder/test1', lastExecutionType: 'SUCCESS', durationMs: 1000 },
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
        { name: 'test1', path: '/folder/test1', lastExecutionType: 'SUCCESS', durationMs: 1000 },
      ];

      const expectedResult: TestTreeNode[] = [
        {
          name: 'folder',
          children: [{ name: 'test1' }],
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
        { name: 'test1', path: '/folder/test1', lastExecutionType: 'SUCCESS', durationMs: 1000 },
      ];

      const mockStrategy = createMockTreeOrganizationStrategy([]);

      fixture.componentRef.setInput('tests', tests1);
      fixture.componentRef.setInput('strategy', mockStrategy);
      fixture.detectChanges();

      component.dataSource();
      expect(mockStrategy.buildTree).toHaveBeenCalledTimes(1);

      const tests2: Test[] = [
        { name: 'test1', path: '/folder/test1', lastExecutionType: 'SUCCESS', durationMs: 1000 },
        { name: 'test2', path: '/folder/test2', lastExecutionType: 'FAILURE', durationMs: 2000 },
      ];

      fixture.componentRef.setInput('tests', tests2);
      fixture.detectChanges();

      component.dataSource();
      expect(mockStrategy.buildTree).toHaveBeenCalledTimes(2);
    });

    it('should recalculate when strategy changes', () => {
      const tests: Test[] = [
        { name: 'test1', path: '/folder/test1', lastExecutionType: 'SUCCESS', durationMs: 1000 },
      ];

      const strategy1 = createMockTreeOrganizationStrategy([
        {
          name: 'result1',
          test: {
            name: 'test1',
            path: '/folder/test1',
            lastExecutionType: 'SUCCESS',
            durationMs: 1000,
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
          name: 'result2',
          test: {
            name: 'test1',
            path: '/folder/test1',
            lastExecutionType: 'SUCCESS',
            durationMs: 1000,
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
      const node: TestTreeNode = { name: 'test' };
      expect(component.childrenAccessor(node)).toEqual([]);
    });

    it('should return children array when children exists', () => {
      const children: TestTreeNode[] = [{ name: 'child1' }, { name: 'child2' }];
      const node: TestTreeNode = { name: 'parent', children };

      expect(component.childrenAccessor(node)).toEqual(children);
    });

    it('should return empty array for empty children', () => {
      const node: TestTreeNode = { name: 'parent', children: [] };
      expect(component.childrenAccessor(node)).toEqual([]);
    });

    it('should work with single child', () => {
      const node: TestTreeNode = {
        name: 'parent',
        children: [{ name: 'child' }],
      };

      expect(component.childrenAccessor(node)).toHaveLength(1);
      expect(component.childrenAccessor(node)[0].name).toBe('child');
    });
  });

  describe('hasChild', () => {
    it('should return false when children is undefined', () => {
      const node: TestTreeNode = { name: 'test' };
      expect(component.hasChild(0, node)).toBe(false);
    });

    it('should return false when children is empty array', () => {
      const node: TestTreeNode = { name: 'parent', children: [] };
      expect(component.hasChild(0, node)).toBe(false);
    });

    it('should return true when children exists with items', () => {
      const node: TestTreeNode = {
        name: 'parent',
        children: [{ name: 'child' }],
      };

      expect(component.hasChild(0, node)).toBe(true);
    });

    it('should return true with multiple children', () => {
      const node: TestTreeNode = {
        name: 'parent',
        children: [{ name: 'child1' }, { name: 'child2' }, { name: 'child3' }],
      };

      expect(component.hasChild(0, node)).toBe(true);
    });

    it('should ignore index parameter value', () => {
      const node: TestTreeNode = {
        name: 'parent',
        children: [{ name: 'child' }],
      };

      expect(component.hasChild(0, node)).toBe(component.hasChild(999, node));
    });
  });

  describe('TestTreeNode Interface', () => {
    it('should support name property', () => {
      const node: TestTreeNode = { name: 'test' };
      expect(node.name).toBe('test');
    });

    it('should support optional test property', () => {
      const test: Test = {
        name: 'test1',
        path: '/test1',
        lastExecutionType: 'SUCCESS',
        durationMs: 1500,
      };

      const node: TestTreeNode = { name: 'test1', test };
      expect(node.test).toEqual(test);
    });

    it('should support optional children property', () => {
      const children: TestTreeNode[] = [{ name: 'child' }];
      const node: TestTreeNode = { name: 'parent', children };

      expect(node.children).toEqual(children);
    });

    it('should allow test without children', () => {
      const test: Test = {
        name: 'test1',
        path: '/test1',
        lastExecutionType: 'SUCCESS',
        durationMs: 2000,
      };

      const node: TestTreeNode = { name: 'test1', test };
      expect(node.test).toBeDefined();
      expect(node.children).toBeUndefined();
    });

    it('should allow folder without test', () => {
      const node: TestTreeNode = {
        name: 'folder',
        children: [{ name: 'test' }],
        testCount: { ...defaultTestCounts },
      };

      expect(node.test).toBeUndefined();
      expect(node.children).toBeDefined();
    });
  });

  describe('getIcon', () => {
    it('should return folder icon for group nodes', () => {
      const node: TestTreeNode = { name: 'folder', children: [] };
      expect(component.getIcon(node)).toBe('folder');
    });

    it('should return check_circle for SUCCESS tests', () => {
      const node: TestTreeNode = {
        name: 'test',
        test: {
          name: 'test',
          path: '/test',
          lastExecutionType: 'SUCCESS',
        },
      };

      expect(component.getIcon(node)).toBe('check_circle');
    });

    it('should return cancel for FAILURE tests', () => {
      const node: TestTreeNode = {
        name: 'test',
        test: {
          name: 'test',
          path: '/test',
          lastExecutionType: 'FAILURE',
        },
      };

      expect(component.getIcon(node)).toBe('cancel');
    });

    it('should return error for ERROR tests', () => {
      const node: TestTreeNode = {
        name: 'test',
        test: {
          name: 'test',
          path: '/test',
          lastExecutionType: 'ERROR',
        },
      };

      expect(component.getIcon(node)).toBe('error');
    });

    it('should return skip_next for SKIPPED tests', () => {
      const node: TestTreeNode = {
        name: 'test',
        test: {
          name: 'test',
          path: '/test',
          lastExecutionType: 'SKIPPED',
        },
      };

      expect(component.getIcon(node)).toBe('skip_next');
    });
  });

  describe('getColor', () => {
    it('should return inherit for group nodes', () => {
      const node: TestTreeNode = { name: 'folder', children: [] };
      expect(component.getColor(node)).toBe('inherit');
    });

    it('should return green for SUCCESS tests', () => {
      const node: TestTreeNode = {
        name: 'test',
        test: {
          name: 'test',
          path: '/test',
          lastExecutionType: 'SUCCESS',
        },
      };

      expect(component.getColor(node)).toBe('#4caf50');
    });

    it('should return red for FAILURE tests', () => {
      const node: TestTreeNode = {
        name: 'test',
        test: {
          name: 'test',
          path: '/test',
          lastExecutionType: 'FAILURE',
        },
      };

      expect(component.getColor(node)).toBe('#f44336');
    });

    it('should return orange for ERROR tests', () => {
      const node: TestTreeNode = {
        name: 'test',
        test: {
          name: 'test',
          path: '/test',
          lastExecutionType: 'ERROR',
        },
      };

      expect(component.getColor(node)).toBe('#ff9800');
    });

    it('should return gray for SKIPPED tests', () => {
      const node: TestTreeNode = {
        name: 'test',
        test: {
          name: 'test',
          path: '/test',
          lastExecutionType: 'SKIPPED',
        },
      };

      expect(component.getColor(node)).toBe('#9e9e9e');
    });
  });

  describe('TestTreeNode Interface - Duration', () => {
    it('should support optional durationMs on test', () => {
      const test: Test = {
        name: 'test1',
        path: '/test1',
        lastExecutionType: 'SUCCESS',
        durationMs: 1500,
      };

      const node: TestTreeNode = { name: 'test1', test };
      expect(node.test?.durationMs).toBe(1500);
    });

    it('should support optional totalDurationMs on group', () => {
      const node: TestTreeNode = {
        name: 'folder',
        children: [],
        totalDurationMs: 5000,
      };

      expect(node.totalDurationMs).toBe(5000);
    });

    it('should allow nodes without duration', () => {
      const node: TestTreeNode = { name: 'test' };
      expect(node.totalDurationMs).toBeUndefined();
    });
  });

  describe('filteredTests Computed Signal', () => {
    it('should return all tests when no filter strategy is provided', () => {
      const tests: Test[] = [
        { name: 'test1', path: '/test1', lastExecutionType: 'SUCCESS' },
        { name: 'test2', path: '/test2', lastExecutionType: 'FAILURE' },
      ];

      fixture.componentRef.setInput('tests', tests);
      fixture.componentRef.setInput('filterStrategy', null);
      fixture.detectChanges();

      expect(component.filteredTests()).toEqual(tests);
    });

    it('should apply filter strategy when provided', () => {
      const tests: Test[] = [
        { name: 'test1', path: '/test1', lastExecutionType: 'SUCCESS' },
        { name: 'test2', path: '/test2', lastExecutionType: 'FAILURE' },
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
        { name: 'test1', path: '/test1', lastExecutionType: 'SUCCESS' },
        { name: 'test2', path: '/test2', lastExecutionType: 'FAILURE' },
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
        { name: 'test1', path: '/folder/test1', lastExecutionType: 'SUCCESS' },
      ];

      const mockSort: TreeSortStrategy = {
        sort: vi
          .fn()
          .mockReturnValue([{ name: 'sorted', children: [], testCount: { ...defaultTestCounts } }]),
      };

      const mockStrategy = createMockTreeOrganizationStrategy([
        { name: 'unsorted', children: [], testCount: { ...defaultTestCounts } },
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
        { name: 'test1', path: '/folder/test1', lastExecutionType: 'SUCCESS' },
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
        { name: 'test', children: [], testCount: { ...defaultTestCounts } },
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
        { name: 'test1', path: '/folder/test1', lastExecutionType: 'SUCCESS' },
      ];

      const expectedNodes: TestTreeNode[] = [
        { name: 'test1', children: [], testCount: { ...defaultTestCounts } },
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
        { name: 'test1', path: '/folder/test1', lastExecutionType: 'SUCCESS' },
        { name: 'test2', path: '/folder/test2', lastExecutionType: 'FAILURE' },
      ];

      const filteredTests: Test[] = [tests[0]];

      const mockFilter = createMockTestFilterStrategy(filteredTests);

      const mockStrategy = createMockTreeOrganizationStrategy([
        { name: 'test1', testCount: { ...defaultTestCounts } },
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
        { name: 'test1', path: '/folder/test1', lastExecutionType: 'SUCCESS' },
        { name: 'test2', path: '/folder/test2', lastExecutionType: 'FAILURE' },
      ];

      const filteredTests: Test[] = [tests[0]];

      const mockFilter = createMockTestFilterStrategy(filteredTests);

      const mockSort: TreeSortStrategy = {
        sort: vi
          .fn()
          .mockReturnValue([{ name: 'sorted', children: [], testCount: { ...defaultTestCounts } }]),
      };

      const mockStrategy = createMockTreeOrganizationStrategy([
        { name: 'unsorted', children: [], testCount: { ...defaultTestCounts } },
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
        { name: 'test1', path: '/folder/test1', lastExecutionType: 'SUCCESS' },
      ];
      const mockStrategy = createMockTreeOrganizationStrategy([
        { name: 'test1', children: [], testCount: { ...defaultTestCounts } },
      ]);

      fixture.componentRef.setInput('tests', tests);
      fixture.componentRef.setInput('strategy', mockStrategy);
      fixture.detectChanges();

      const noTestsMessage = fixture.nativeElement.querySelector('.no-tests-message');
      expect(noTestsMessage).toBeFalsy();
    });
  });
});
