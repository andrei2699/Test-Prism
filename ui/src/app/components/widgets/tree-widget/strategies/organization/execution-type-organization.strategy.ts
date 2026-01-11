import { Test } from '../../../../../types/TestReport';
import { TestTreeNode } from '../../test-tree/test-tree';
import { BaseTreeOrganizationStrategy } from './base-tree-organization.strategy';
import { getLastExecution } from '../../../../../utils/testExecutionUtils';

export class ExecutionTypeOrganizationStrategy extends BaseTreeOrganizationStrategy {
  private readonly statusOrder = ['SUCCESS', 'FAILURE', 'SKIPPED', 'ERROR'];

  getName(): string {
    return 'status';
  }

  buildTree(tests: Test[]): TestTreeNode[] {
    const statusMap = new Map<string, TestTreeNode>();
    const rootNodes: TestTreeNode[] = [];

    tests.forEach(test => {
      const lastExecution = getLastExecution(test);
      if (!lastExecution) {
        return;
      }
      const status = lastExecution.status;
      this.ensureGroupNode(status, status, statusMap, rootNodes);
      this.addTestToGroup(test, status, statusMap);
    });

    const sorted = rootNodes.sort(
      (a, b) => this.statusOrder.indexOf(a.name) - this.statusOrder.indexOf(b.name),
    );

    this.calculateTotalDurations(sorted);
    this.calculateTestCounts(sorted);
    return sorted;
  }
}
