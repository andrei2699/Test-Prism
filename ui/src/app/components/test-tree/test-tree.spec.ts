import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestTree, TestTreeNode } from './test-tree';
import { Test } from '../../types/TestReport';

describe('TestTree', () => {
  let component: TestTree;
  let fixture: ComponentFixture<TestTree>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestTree],
    }).compileComponents();

    fixture = TestBed.createComponent(TestTree);
    component = fixture.componentInstance;
  });

  describe('buildTreeNodes', () => {
    it('should return empty array for empty tests', () => {
      const tests: Test[] = [];
      const result = component['buildTreeNodes'](tests);
      expect(result).toEqual([]);
    });

    it('should handle single test without folder', () => {
      const tests: Test[] = [
        {
          name: 'test1',
          path: '/test1',
          lastExecutionType: 'SUCCESS',
        },
      ];

      const result = component['buildTreeNodes'](tests);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('test1');
      expect(result[0].test).toEqual(tests[0]);
      expect(result[0].children).toBeUndefined();
    });

    it('should handle single test with one folder', () => {
      const tests: Test[] = [
        {
          name: 'test1',
          path: '/folder/test1',
          lastExecutionType: 'SUCCESS',
        },
      ];

      const result = component['buildTreeNodes'](tests);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('folder');
      expect(result[0].children).toHaveLength(1);
      expect(result[0].children?.[0].name).toBe('test1');
      expect(result[0].children?.[0].test).toEqual(tests[0]);
    });

    it('should handle single test with nested folders', () => {
      const tests: Test[] = [
        {
          name: 'test1',
          path: '/folder1/folder2/folder3/test1',
          lastExecutionType: 'SUCCESS',
        },
      ];

      const result = component['buildTreeNodes'](tests);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('folder1');
      expect(result[0].children?.[0].name).toBe('folder2');
      expect(result[0].children?.[0].children?.[0].name).toBe('folder3');
      expect(result[0].children?.[0].children?.[0].children?.[0].name).toBe('test1');
    });

    it('should group multiple tests under same folder', () => {
      const tests: Test[] = [
        {
          name: 'test1',
          path: '/folder/test1',
          lastExecutionType: 'SUCCESS',
        },
        {
          name: 'test2',
          path: '/folder/test2',
          lastExecutionType: 'FAILURE',
        },
      ];

      const result = component['buildTreeNodes'](tests);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('folder');
      expect(result[0].children).toHaveLength(2);
      expect(result[0].children?.[0].name).toBe('test1');
      expect(result[0].children?.[1].name).toBe('test2');
    });

    it('should handle multiple top-level folders', () => {
      const tests: Test[] = [
        {
          name: 'test1',
          path: '/folder1/test1',
          lastExecutionType: 'SUCCESS',
        },
        {
          name: 'test2',
          path: '/folder2/test2',
          lastExecutionType: 'FAILURE',
        },
      ];

      const result = component['buildTreeNodes'](tests);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('folder1');
      expect(result[1].name).toBe('folder2');
      expect(result[0].children?.[0].name).toBe('test1');
      expect(result[1].children?.[0].name).toBe('test2');
    });

    it('should handle mixed root-level and folder tests', () => {
      const tests: Test[] = [
        {
          name: 'rootTest',
          path: '/rootTest',
          lastExecutionType: 'SUCCESS',
        },
        {
          name: 'folderTest',
          path: '/folder/folderTest',
          lastExecutionType: 'SUCCESS',
        },
      ];

      const result = component['buildTreeNodes'](tests);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('rootTest');
      expect(result[1].name).toBe('folder');
    });

    it('should handle complex nested structure with shared parents', () => {
      const tests: Test[] = [
        {
          name: 'test1',
          path: '/src/unit/test1',
          lastExecutionType: 'SUCCESS',
        },
        {
          name: 'test2',
          path: '/src/unit/test2',
          lastExecutionType: 'SUCCESS',
        },
        {
          name: 'test3',
          path: '/src/integration/test3',
          lastExecutionType: 'FAILURE',
        },
        {
          name: 'test4',
          path: '/src/integration/nested/test4',
          lastExecutionType: 'SKIPPED',
        },
      ];

      const result = component['buildTreeNodes'](tests);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('src');
      expect(result[0].children).toHaveLength(2);

      const unitFolder = result[0].children?.find(c => c.name === 'unit');
      const integrationFolder = result[0].children?.find(c => c.name === 'integration');

      expect(unitFolder?.children).toHaveLength(2);
      expect(integrationFolder?.children).toHaveLength(2);
      expect(integrationFolder?.children?.[1].children).toHaveLength(1);
    });

    it('should preserve test metadata', () => {
      const tests: Test[] = [
        {
          name: 'test1',
          path: '/folder/test1',
          lastExecutionType: 'ERROR',
        },
      ];

      const result = component['buildTreeNodes'](tests);
      const testNode = result[0].children?.[0];

      expect(testNode?.test?.lastExecutionType).toBe('ERROR');
      expect(testNode?.test?.name).toBe('test1');
      expect(testNode?.test?.path).toBe('/folder/test1');
    });

    it('should handle paths with trailing slashes', () => {
      const tests: Test[] = [
        {
          name: 'test1',
          path: '/folder//test1',
          lastExecutionType: 'SUCCESS',
        },
      ];

      const result = component['buildTreeNodes'](tests);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('folder');
      expect(result[0].children?.[0].name).toBe('test1');
    });

    it('should maintain parent-child relationships correctly', () => {
      const tests: Test[] = [
        {
          name: 'test1',
          path: '/a/b/c/test1',
          lastExecutionType: 'SUCCESS',
        },
        {
          name: 'test2',
          path: '/a/b/test2',
          lastExecutionType: 'SUCCESS',
        },
      ];

      const result = component['buildTreeNodes'](tests);

      const folderA = result[0];
      expect(folderA.name).toBe('a');

      const folderB = folderA.children?.[0];
      expect(folderB?.name).toBe('b');

      // folderB should have 2 children: folder c and test2
      expect(folderB?.children).toHaveLength(2);
    });
  });

  describe('childrenAccessor', () => {
    it('should return empty array for nodes without children', () => {
      const node: TestTreeNode = {
        name: 'test',
      };

      const result = component.childrenAccessor(node);

      expect(result).toEqual([]);
    });

    it('should return children for nodes with children', () => {
      const childNode: TestTreeNode = { name: 'child' };
      const node: TestTreeNode = {
        name: 'parent',
        children: [childNode],
      };

      const result = component.childrenAccessor(node);

      expect(result).toEqual([childNode]);
    });
  });

  describe('hasChild', () => {
    it('should return false for nodes without children', () => {
      const node: TestTreeNode = {
        name: 'test',
      };

      const result = component.hasChild(0, node);

      expect(result).toBe(false);
    });

    it('should return false for nodes with empty children array', () => {
      const node: TestTreeNode = {
        name: 'parent',
        children: [],
      };

      const result = component.hasChild(0, node);

      expect(result).toBe(false);
    });

    it('should return true for nodes with children', () => {
      const node: TestTreeNode = {
        name: 'parent',
        children: [{ name: 'child' }],
      };

      const result = component.hasChild(0, node);

      expect(result).toBe(true);
    });
  });
});
