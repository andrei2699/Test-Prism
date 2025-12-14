import { TestTreeNode } from '../test-tree';
import { Test } from '../../../types/TestReport';

export interface TreeOrganizationStrategy {
  getName(): string;

  buildTree(tests: Test[]): TestTreeNode[];
}
