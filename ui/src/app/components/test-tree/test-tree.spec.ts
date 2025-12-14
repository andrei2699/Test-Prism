import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestTree, TestTreeNode } from './test-tree';
import { FolderOrganizationStrategy } from './strategies/folder-organization.strategy';
import { TreeOrganizationStrategy } from './strategies/tree-organization-strategy.interface';
import { Test } from '../../types/TestReport';
import { vi } from 'vitest';

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
        { name: 'test1', path: '/folder/test1', lastExecutionType: 'SUCCESS' },
      ];

      const mockStrategy: TreeOrganizationStrategy = {
        buildTree: vi.fn().mockReturnValue([]),
        getName: vi.fn().mockReturnValue('mock'),
      };

      fixture.componentRef.setInput('tests', tests);
      fixture.componentRef.setInput('strategy', mockStrategy);
      fixture.detectChanges();

      component.dataSource();

      expect(mockStrategy.buildTree).toHaveBeenCalledWith(tests);
    });

    it('should return result from strategy buildTree', () => {
      const tests: Test[] = [
        { name: 'test1', path: '/folder/test1', lastExecutionType: 'SUCCESS' },
      ];

      const expectedResult: TestTreeNode[] = [{ name: 'folder', children: [{ name: 'test1' }] }];

      const mockStrategy: TreeOrganizationStrategy = {
        buildTree: vi.fn().mockReturnValue(expectedResult),
        getName: vi.fn().mockReturnValue('mock'),
      };

      fixture.componentRef.setInput('tests', tests);
      fixture.componentRef.setInput('strategy', mockStrategy);
      fixture.detectChanges();

      const result = component.dataSource();

      expect(result).toEqual(expectedResult);
    });

    it('should recalculate when tests change', () => {
      const tests1: Test[] = [
        { name: 'test1', path: '/folder/test1', lastExecutionType: 'SUCCESS' },
      ];

      const mockStrategy: TreeOrganizationStrategy = {
        buildTree: vi.fn().mockReturnValue([]),
        getName: vi.fn().mockReturnValue('mock'),
      };

      fixture.componentRef.setInput('tests', tests1);
      fixture.componentRef.setInput('strategy', mockStrategy);
      fixture.detectChanges();

      component.dataSource();
      expect(mockStrategy.buildTree).toHaveBeenCalledTimes(1);

      const tests2: Test[] = [
        { name: 'test1', path: '/folder/test1', lastExecutionType: 'SUCCESS' },
        { name: 'test2', path: '/folder/test2', lastExecutionType: 'FAILURE' },
      ];

      fixture.componentRef.setInput('tests', tests2);
      fixture.detectChanges();

      component.dataSource();
      expect(mockStrategy.buildTree).toHaveBeenCalledTimes(2);
    });

    it('should recalculate when strategy changes', () => {
      const tests: Test[] = [
        { name: 'test1', path: '/folder/test1', lastExecutionType: 'SUCCESS' },
      ];

      const strategy1: TreeOrganizationStrategy = {
        buildTree: vi.fn().mockReturnValue([{ name: 'result1' }]),
        getName: vi.fn().mockReturnValue('strategy1'),
      };

      fixture.componentRef.setInput('tests', tests);
      fixture.componentRef.setInput('strategy', strategy1);
      fixture.detectChanges();

      let result = component.dataSource();
      expect(result[0].name).toBe('result1');

      const strategy2: TreeOrganizationStrategy = {
        buildTree: vi.fn().mockReturnValue([{ name: 'result2' }]),
        getName: vi.fn().mockReturnValue('strategy2'),
      };

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
      };

      const node: TestTreeNode = { name: 'test1', test };
      expect(node.test).toBeDefined();
      expect(node.children).toBeUndefined();
    });

    it('should allow folder without test', () => {
      const node: TestTreeNode = {
        name: 'folder',
        children: [{ name: 'test' }],
      };

      expect(node.test).toBeUndefined();
      expect(node.children).toBeDefined();
    });
  });
});
