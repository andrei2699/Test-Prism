import { TestTreeNode } from '../../test-tree';

export interface TreeSortStrategy {
  sort(nodes: TestTreeNode[]): TestTreeNode[];
}
