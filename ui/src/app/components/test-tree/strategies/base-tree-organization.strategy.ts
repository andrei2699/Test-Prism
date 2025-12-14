import { TestTreeNode } from '../test-tree';
import { Test } from '../../../types/TestReport';
import { TreeOrganizationStrategy } from './tree-organization-strategy.interface';

export abstract class BaseTreeOrganizationStrategy implements TreeOrganizationStrategy {
  abstract getName(): string;

  abstract buildTree(tests: Test[]): TestTreeNode[];

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
}
