import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Test } from '../../types/TestReport';
import { TreeOrganizationStrategy } from './strategies/tree-organization-strategy.interface';
import { TreeOrganizationStrategyFactory } from './strategies/tree-organization-strategy.factory';
import { HumanizeDurationPipe } from '../../pipes/humanize-duration.pipe';

export interface TestTreeNode {
  name: string;
  test?: Test;
  children?: TestTreeNode[];
  icon?: string;
  color?: string;
}

@Component({
  selector: 'app-test-tree',
  imports: [CommonModule, MatTreeModule, MatButtonModule, MatIconModule, HumanizeDurationPipe],
  templateUrl: './test-tree.html',
  styleUrl: './test-tree.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestTree {
  tests = input.required<Test[]>();

  strategy = input<TreeOrganizationStrategy>(TreeOrganizationStrategyFactory.create('folder'));

  dataSource = computed<TestTreeNode[]>(() => this.strategy().buildTree(this.tests()));

  childrenAccessor = (node: TestTreeNode) => node.children ?? [];

  hasChild = (_: number, node: TestTreeNode) => !!node.children && node.children.length > 0;

  getIcon = (node: TestTreeNode): string => this.strategy().getIcon(node);

  getColor = (node: TestTreeNode): string => this.strategy().getColor(node);
}
