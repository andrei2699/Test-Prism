import { Test } from '../../../types/TestReport';
import { TestTreeNode } from '../test-tree';
import { BaseTreeOrganizationStrategy } from './base-tree-organization.strategy';

export class ExecutionTypeOrganizationStrategy extends BaseTreeOrganizationStrategy {
  private readonly statusOrder = ['SUCCESS', 'FAILURE', 'SKIPPED', 'ERROR'];

  getName(): string {
    return 'status';
  }

  buildTree(tests: Test[]): TestTreeNode[] {
    const statusMap = new Map<string, TestTreeNode>();
    const rootNodes: TestTreeNode[] = [];

    tests.forEach(test => {
      const status = test.lastExecutionType;
      this.ensureGroupNode(status, status, statusMap, rootNodes);
      this.addTestToGroup(test, status, statusMap);
    });

    return rootNodes.sort(
      (a, b) => this.statusOrder.indexOf(a.name) - this.statusOrder.indexOf(b.name),
    );
  }
}
