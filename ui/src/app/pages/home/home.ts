import { Component, signal } from '@angular/core';
import { TestTree } from '../../components/test-tree/test-tree';
import { TestDistributionPie } from '../../components/test-distribution-pie/test-distribution-pie';
import { TestFilterInputComponent } from '../../components/test-filter-input/test-filter-input.component';
import { TestReport } from '../../types/TestReport';
import { TreeOrganizationStrategy } from '../../components/test-tree/strategies/organization/tree-organization-strategy.interface';
import { TestFilterStrategy } from '../../components/test-tree/strategies/filter/test-filter-strategy.interface';
import { TreeSortStrategy } from '../../components/test-tree/strategies/sort/tree-sort-strategy.interface';
import { LARGE_TEST_DATA } from './test-data';
import { DistributionStrategy } from '../../components/test-distribution-pie/strategies/distribution-strategy.interface';
import { TreeOrganizationStrategyFactory } from '../../components/test-tree/strategies/organization/tree-organization-strategy.factory';
import { DistributionStrategyFactory } from '../../components/test-distribution-pie/strategies/distribution-strategy.factory';
import { NameFilterStrategy } from '../../components/test-tree/strategies/filter/name-filter.strategy';
import { TreeSortStrategyFactory } from '../../components/test-tree/strategies/sort/tree-sort-strategy.factory';

@Component({
  selector: 'app-home',
  imports: [TestTree, TestDistributionPie, TestFilterInputComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  testReport = signal<TestReport>(LARGE_TEST_DATA);

  summaryOrganizationStrategy = signal<DistributionStrategy>(
    DistributionStrategyFactory.create('status'),
  );
  treeOrganizationStrategy = signal<TreeOrganizationStrategy>(
    TreeOrganizationStrategyFactory.create('folder'),
  );

  filterText = signal<string>('');
  filterStrategy = signal<TestFilterStrategy | null>(null);
  sortStrategies = signal<TreeSortStrategy[]>([TreeSortStrategyFactory.create('name')]);

  onFilterChange(filterText: string): void {
    this.filterText.set(filterText);
    this.filterStrategy.set(filterText.trim() ? new NameFilterStrategy(filterText) : null);
  }
}
