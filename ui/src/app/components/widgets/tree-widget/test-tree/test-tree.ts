import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Test, TestExecutionStatus } from '../../../../types/TestReport';
import { TreeOrganizationStrategy } from '../strategies/organization/tree-organization-strategy.interface';
import { TreeSortStrategy } from '../strategies/sort/tree-sort-strategy.interface';
import { TestFilterStrategy } from '../strategies/filter/test-filter-strategy.interface';
import { HumanizeDurationPipe } from '../../../../pipes/humanize-duration.pipe';
import { TestCountDisplayComponent } from '../test-count-display/test-count-display';
import { TestColors } from '../../../../types/Layout';
import { getLastExecution } from '../../../../utils/testExecutionUtils';

export interface TestTreeNode {
  id: string;
  name: string;
  test?: Test;
  children?: TestTreeNode[];
  icon?: string;
  color?: string;
  totalDurationMs?: number;
  testCount?: Record<TestExecutionStatus, number>;
}

@Component({
  selector: 'app-test-tree',
  imports: [
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
  colors = input.required<TestColors>();
  tests = input.required<Test[]>();
  strategy = input.required<TreeOrganizationStrategy>();
  filterStrategy = input.required<TestFilterStrategy | null>();
  sortStrategies = input.required<TreeSortStrategy[]>();
  selectedTest = input<Test | null>(null);
  testSelected = output<Test>();

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

  trackByFn = (_: number, node: TestTreeNode) => node.id;

  expansionKey = (node: TestTreeNode) => node.id;

  hasChild = (_: number, node: TestTreeNode) => !!node.children && node.children.length > 0;

  getIcon = (node: TestTreeNode): string => this.strategy().getIcon(node);

  getColor = (node: TestTreeNode): string => this.strategy().getColor(node, this.colors());

  onNodeClick(node: TestTreeNode) {
    if (node.test) {
      this.testSelected.emit(node.test);
    }
  }

  isNodeSelected(node: TestTreeNode): boolean {
    return !!node.test && node.test === this.selectedTest();
  }

  getLastExecutionMilliseconds(node: TestTreeNode): number {
    return getLastExecution(node.test!)?.durationMs ?? 0;
  }
}
