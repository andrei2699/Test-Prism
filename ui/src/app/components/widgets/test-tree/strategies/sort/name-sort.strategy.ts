import { TestTreeNode } from '../../test-tree';
import { TreeSortStrategy } from './tree-sort-strategy.interface';

export class NameSortStrategy implements TreeSortStrategy {
  sort(nodes: TestTreeNode[]): TestTreeNode[] {
    return nodes
      .map(node => ({
        ...node,
        children: node.children ? this.sort(node.children) : undefined,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}
