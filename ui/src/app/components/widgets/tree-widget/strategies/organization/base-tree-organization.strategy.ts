import { TestTreeNode } from '../../test-tree/test-tree';
import { Test, TestExecutionType } from '../../../../../types/TestReport';
import { TreeOrganizationStrategy } from './tree-organization-strategy.interface';
import { TestColors } from '../../../../../types/Layout';

export abstract class BaseTreeOrganizationStrategy implements TreeOrganizationStrategy {
  abstract getName(): string;

  abstract buildTree(tests: Test[]): TestTreeNode[];

  getIcon(node: TestTreeNode): string {
    if (!node.test) {
      return 'folder';
    }

    const lastExecution = node.test.executions[node.test.executions.length - 1];
    if (!lastExecution) {
      return 'help';
    }

    switch (lastExecution.status) {
      case 'SUCCESS':
        return 'check_circle';
      case 'FAILURE':
        return 'cancel';
      case 'ERROR':
        return 'error';
      case 'SKIPPED':
        return 'skip_next';
      default:
        return 'help';
    }
  }

  getColor(node: TestTreeNode, colors: TestColors): string {
    if (!node.test) {
      return 'inherit';
    }

    const lastExecution = node.test.executions[node.test.executions.length - 1];
    if (!lastExecution) {
      return 'inherit';
    }

    return colors[lastExecution.status] || 'inherit';
  }

  protected createTestNode(test: Test): TestTreeNode {
    return {
      id: `${test.path}/${test.name}`,
      name: test.name,
      test,
    };
  }

  protected createGroupNode(key: string, name: string): TestTreeNode {
    return {
      id: key,
      name,
      children: [],
      testCount: {
        SUCCESS: 0,
        FAILURE: 0,
        SKIPPED: 0,
        ERROR: 0,
      },
    };
  }

  protected addNodeToParent(
    parentKey: string,
    node: TestTreeNode,
    nodeMap: Map<string, TestTreeNode>,
    rootNodes: TestTreeNode[],
    separator: string,
  ): void {
    if (parentKey.includes(separator)) {
      const parentPath = parentKey.substring(0, parentKey.lastIndexOf(separator));
      const parentNode = nodeMap.get(parentPath);
      if (parentNode?.children) {
        parentNode.children.push(node);
      }
    } else {
      rootNodes.push(node);
    }
  }

  protected addTestToGroup(
    test: Test,
    groupKey: string,
    groupMap: Map<string, TestTreeNode>,
  ): void {
    const testNode = this.createTestNode(test);
    const groupNode = groupMap.get(groupKey);
    if (groupNode?.children) {
      groupNode.children.push(testNode);
    }
  }

  protected ensureGroupNode(
    groupKey: string,
    groupName: string,
    groupMap: Map<string, TestTreeNode>,
    rootNodes: TestTreeNode[],
  ): void {
    if (!groupMap.has(groupKey)) {
      const groupNode = this.createGroupNode(groupKey, groupName);
      groupMap.set(groupKey, groupNode);
      rootNodes.push(groupNode);
    }
  }

  protected calculateTotalDurations(nodes: TestTreeNode[]): void {
    nodes.forEach(node => {
      this.calculateNodeTotalDuration(node);
    });
  }

  private calculateNodeTotalDuration(node: TestTreeNode): number {
    if (node.test) {
      const lastExecution = node.test.executions[node.test.executions.length - 1];
      if (lastExecution) {
        return lastExecution.durationMs;
      }
    }

    if (node.children && node.children.length > 0) {
      let total = 0;
      node.children.forEach(child => {
        total += this.calculateNodeTotalDuration(child);
      });
      node.totalDurationMs = total;
      return total;
    }

    return 0;
  }

  protected calculateTestCounts(nodes: TestTreeNode[]): void {
    nodes.forEach(node => {
      this.recursivelyCalculateTestCounts(node);
    });
  }

  private recursivelyCalculateTestCounts(node: TestTreeNode): Record<TestExecutionType, number> {
    const counts: Record<TestExecutionType, number> = {
      SUCCESS: 0,
      FAILURE: 0,
      SKIPPED: 0,
      ERROR: 0,
    };

    if (node.test) {
      const lastExecution = node.test.executions[node.test.executions.length - 1];
      if (lastExecution) {
        counts[lastExecution.status] = 1;
      }
    } else if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        const childCounts = this.recursivelyCalculateTestCounts(child);
        const executionTypes: TestExecutionType[] = ['SUCCESS', 'FAILURE', 'SKIPPED', 'ERROR'];
        for (const type of executionTypes) {
          counts[type] += childCounts[type];
        }
      });
    }
    node.testCount = counts;
    return counts;
  }
}
