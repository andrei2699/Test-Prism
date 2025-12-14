import { TestTreeNode } from '../test-tree';
import { Test } from '../../../types/TestReport';
import { TreeOrganizationStrategy } from './tree-organization-strategy.interface';

export abstract class BaseTreeOrganizationStrategy implements TreeOrganizationStrategy {
  abstract getName(): string;

  abstract buildTree(tests: Test[]): TestTreeNode[];

  getIcon(node: TestTreeNode): string {
    if (!node.test) {
      return 'folder';
    }

    switch (node.test.lastExecutionType) {
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

  getColor(node: TestTreeNode): string {
    if (!node.test) {
      return 'inherit';
    }

    switch (node.test.lastExecutionType) {
      case 'SUCCESS':
        return '#4caf50';
      case 'FAILURE':
        return '#f44336';
      case 'ERROR':
        return '#ff9800';
      case 'SKIPPED':
        return '#9e9e9e';
      default:
        return 'inherit';
    }
  }

  protected createTestNode(test: Test): TestTreeNode {
    return {
      name: test.name,
      test,
    };
  }

  protected createGroupNode(name: string): TestTreeNode {
    return {
      name,
      children: [],
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
      const groupNode = this.createGroupNode(groupName);
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
    if (node.test?.durationMs) {
      return node.test.durationMs;
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
}
