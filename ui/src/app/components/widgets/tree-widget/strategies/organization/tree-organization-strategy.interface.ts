import { TestTreeNode } from '../../test-tree/test-tree';
import { Test } from '../../../../../types/TestReport';

export interface TreeOrganizationStrategy {
  getName(): string;

  buildTree(tests: Test[]): TestTreeNode[];

  getIcon(node: TestTreeNode): string;

  getColor(node: TestTreeNode): string;
}
