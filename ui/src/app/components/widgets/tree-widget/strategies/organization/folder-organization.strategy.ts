import { Test } from '../../../../../types/TestReport';
import { getPathParts } from '../../../../../utils/pathUtils';
import { TestTreeNode } from '../../test-tree/test-tree';
import { BaseTreeOrganizationStrategy } from './base-tree-organization.strategy';

export class FolderOrganizationStrategy extends BaseTreeOrganizationStrategy {
  getName(): string {
    return 'folder';
  }

  buildTree(tests: Test[]): TestTreeNode[] {
    const nodeMap = new Map<string, TestTreeNode>();
    const rootNodes: TestTreeNode[] = [];

    tests.forEach(test => {
      let currentPath = '';
      let parentNode: TestTreeNode | null = null;

      if (test.file) {
        currentPath = test.file;
        let fileNode = nodeMap.get(currentPath);
        if (!fileNode) {
          const fileName = test.file.split(/[/\\]/).pop() || test.file;
          fileNode = this.createGroupNode(currentPath, fileName);
          fileNode.icon = 'description';
          nodeMap.set(currentPath, fileNode);
          rootNodes.push(fileNode);
        }
        parentNode = fileNode;
      }

      const parts = getPathParts(test.path);
      parts.forEach((part: string) => {
        const nextPath = currentPath ? `${currentPath}/${part}` : part;
        let folderNode = nodeMap.get(nextPath);
        if (!folderNode) {
          folderNode = this.createGroupNode(nextPath, part);
          nodeMap.set(nextPath, folderNode);
          if (parentNode) {
            parentNode.children = parentNode.children || [];
            parentNode.children.push(folderNode);
          } else {
            rootNodes.push(folderNode);
          }
        }
        currentPath = nextPath;
        parentNode = folderNode;
      });

      const testNode = this.createTestNode(test);
      if (parentNode) {
        parentNode.children = parentNode.children || [];
        parentNode.children.push(testNode);
      } else {
        rootNodes.push(testNode);
      }
    });

    this.calculateTotalDurations(rootNodes);
    this.calculateTestCounts(rootNodes);
    return rootNodes;
  }
}
