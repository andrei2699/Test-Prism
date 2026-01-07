import { TestTreeNode } from '../../test-tree/test-tree';

export interface TreeSortStrategy {
  sort(nodes: TestTreeNode[]): TestTreeNode[];
}
