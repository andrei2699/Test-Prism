import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Test } from '../../types/TestReport';

export interface TestTreeNode {
  name: string;
  test?: Test;
  children?: TestTreeNode[];
}

@Component({
  selector: 'app-test-tree',
  imports: [MatTreeModule, MatButtonModule, MatIconModule],
  templateUrl: './test-tree.html',
  styleUrl: './test-tree.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestTree {
  tests = input.required<Test[]>();

  dataSource = computed<TestTreeNode[]>(() => this.buildTreeNodes(this.tests()));

  childrenAccessor = (node: TestTreeNode) => node.children ?? [];

  hasChild = (_: number, node: TestTreeNode) => !!node.children && node.children.length > 0;

  private buildTreeNodes(tests: Test[]): TestTreeNode[] {
    const folderMap = new Map<string, TestTreeNode>();
    const rootNodes: TestTreeNode[] = [];

    tests.forEach(test => {
      const pathParts = this.parseTestPath(test.path);
      this.createFolderHierarchy(pathParts, folderMap, rootNodes);
      this.addTestToTree(test, pathParts, folderMap, rootNodes);
    });

    return rootNodes;
  }

  private parseTestPath(path: string): string[] {
    return path.split('/').filter(part => part.length > 0);
  }

  private createFolderHierarchy(
    pathParts: string[],
    folderMap: Map<string, TestTreeNode>,
    rootNodes: TestTreeNode[],
  ): void {
    let currentPath = '';

    pathParts.slice(0, -1).forEach(part => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (folderMap.has(currentPath)) {
        return;
      }

      const folderNode = this.createFolderNode(part);
      folderMap.set(currentPath, folderNode);
      this.addFolderToParent(currentPath, folderNode, folderMap, rootNodes);
    });
  }

  private createFolderNode(name: string): TestTreeNode {
    return {
      name,
      children: [],
    };
  }

  private addFolderToParent(
    currentPath: string,
    folderNode: TestTreeNode,
    folderMap: Map<string, TestTreeNode>,
    rootNodes: TestTreeNode[],
  ): void {
    if (currentPath.includes('/')) {
      const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
      const parentNode = folderMap.get(parentPath);
      if (parentNode?.children) {
        parentNode.children.push(folderNode);
      }
    } else {
      rootNodes.push(folderNode);
    }
  }

  private addTestToTree(
    test: Test,
    pathParts: string[],
    folderMap: Map<string, TestTreeNode>,
    rootNodes: TestTreeNode[],
  ): void {
    const testNode = this.createTestNode(test);

    if (pathParts.length > 1) {
      const parentPath = pathParts.slice(0, -1).join('/');
      const parentNode = folderMap.get(parentPath);
      if (parentNode?.children) {
        parentNode.children.push(testNode);
      }
    } else {
      rootNodes.push(testNode);
    }
  }

  private createTestNode(test: Test): TestTreeNode {
    return {
      name: test.name,
      test,
    };
  }
}
