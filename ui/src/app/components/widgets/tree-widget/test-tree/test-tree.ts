import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Test, TestExecutionType } from '../../../../types/TestReport';
import { TreeOrganizationStrategy } from '../strategies/organization/tree-organization-strategy.interface';
import { TreeOrganizationStrategyFactory } from '../strategies/organization/tree-organization-strategy.factory';
import { TreeSortStrategy } from '../strategies/sort/tree-sort-strategy.interface';
import { TestFilterStrategy } from '../strategies/filter/test-filter-strategy.interface';
import { HumanizeDurationPipe } from '../../../../pipes/humanize-duration.pipe';
import { TestCountDisplayComponent } from '../test-count-display/test-count-display';

export interface TestTreeNode {
  name: string;
  test?: Test;
  children?: TestTreeNode[];
  icon?: string;
  color?: string;
  totalDurationMs?: number;
  testCount?: Record<TestExecutionType, number>;
}

@Component({
  selector: 'app-test-tree',
  imports: [
    CommonModule,
    MatTreeModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    HumanizeDurationPipe,
    TestCountDisplayComponent,
  ],
  templateUrl: './test-tree.html',
  styleUrl: './test-tree.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestTree {
  tests = input.required<Test[]>();

  strategy = input<TreeOrganizationStrategy>(TreeOrganizationStrategyFactory.create('folder'));

  filterStrategy = input<TestFilterStrategy | null>(null);

  sortStrategies = input<TreeSortStrategy[]>([]);

  filteredTests = computed<Test[]>(() => {
    const filter = this.filterStrategy();
    return filter ? filter.filter(this.tests()) : this.tests();
  });

  dataSource = computed<TestTreeNode[]>(() => {
    let nodes = this.strategy().buildTree(this.filteredTests());
    for (const sortStrategy of this.sortStrategies()) {
      nodes = sortStrategy.sort(nodes);
    }
    return nodes;
  });

  childrenAccessor = (node: TestTreeNode) => node.children ?? [];

  hasChild = (_: number, node: TestTreeNode) => !!node.children && node.children.length > 0;

  getIcon = (node: TestTreeNode): string => this.strategy().getIcon(node);

  getColor = (node: TestTreeNode): string => this.strategy().getColor(node);
}
