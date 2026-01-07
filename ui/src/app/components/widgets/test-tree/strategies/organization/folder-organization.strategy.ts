import { Test } from '../../../../../types/TestReport';
import { TestTreeNode } from '../../test-tree';
import { BaseTreeOrganizationStrategy } from './base-tree-organization.strategy';

export class FolderOrganizationStrategy extends BaseTreeOrganizationStrategy {
  private readonly separator = '/';

  getName(): string {
    return 'folder';
  }

  buildTree(tests: Test[]): TestTreeNode[] {
    const nodeMap = new Map<string, TestTreeNode>();
    const rootNodes: TestTreeNode[] = [];

    tests.forEach(test => {
      const pathParts = this.parsePath(test.path);
      this.createHierarchy(pathParts.slice(0, -1), nodeMap, rootNodes);
      this.addTestToHierarchy(test, pathParts, nodeMap, rootNodes);
    });

    this.calculateTotalDurations(rootNodes);
    this.calculateTestCounts(rootNodes);
    return rootNodes;
  }

  private parsePath(path: string): string[] {
    return path.split(this.separator).filter(part => part.length > 0);
  }

  private createHierarchy(
    pathParts: string[],
    nodeMap: Map<string, TestTreeNode>,
    rootNodes: TestTreeNode[],
  ): void {
    let currentPath = '';

    pathParts.forEach(part => {
      currentPath = currentPath ? `${currentPath}${this.separator}${part}` : part;

      if (nodeMap.has(currentPath)) {
        return;
      }

      const folderNode = this.createGroupNode(part);
      nodeMap.set(currentPath, folderNode);
      this.addNodeToParent(currentPath, folderNode, nodeMap, rootNodes, this.separator);
    });
  }

  private addTestToHierarchy(
    test: Test,
    pathParts: string[],
    nodeMap: Map<string, TestTreeNode>,
    rootNodes: TestTreeNode[],
  ): void {
    const testNode = this.createTestNode(test);

    if (pathParts.length > 1) {
      const parentPath = pathParts.slice(0, -1).join(this.separator);
      const parentNode = nodeMap.get(parentPath);
      if (parentNode?.children) {
        parentNode.children.push(testNode);
      }
    } else {
      rootNodes.push(testNode);
    }
  }
}
