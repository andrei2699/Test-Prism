import { TestTreeNode } from '../../test-tree/test-tree';
import { TreeSortStrategy } from './tree-sort-strategy.interface';

export class FolderSortStrategy implements TreeSortStrategy {
  sort(nodes: TestTreeNode[]): TestTreeNode[] {
    return nodes
      .map(node => ({
        ...node,
        children: node.children ? this.sort(node.children) : undefined,
      }))
      .sort((a, b) => {
        const aIsFolder = !a.test;
        const bIsFolder = !b.test;

        if (aIsFolder && !bIsFolder) {
          return -1;
        }
        if (!aIsFolder && bIsFolder) {
          return 1;
        }
        return 0;
      });
  }
}
