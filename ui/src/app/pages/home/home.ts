import { Component, inject } from '@angular/core';
import { TestTree } from '../../components/test-tree/test-tree';
import { TestDistributionPie } from '../../components/test-distribution-pie/test-distribution-pie';
import {
  TestFilterInputComponent,
  FilterState,
} from '../../components/test-filter-input/test-filter-input.component';
import { LoadingComponent } from '../../components/loading/loading.component';
import { ErrorMessageComponent } from '../../components/error-message/error-message.component';
import { TestExecutionType } from '../../types/TestReport';
import { TreeOrganizationStrategyFactory } from '../../components/test-tree/strategies/organization/tree-organization-strategy.factory';
import { DistributionStrategyFactory } from '../../components/test-distribution-pie/strategies/distribution-strategy.factory';
import { NameFilterStrategy } from '../../components/test-tree/strategies/filter/name-filter.strategy';
import { StatusFilterStrategy } from '../../components/test-tree/strategies/filter/status-filter.strategy';
import { CompositeFilterStrategy } from '../../components/test-tree/strategies/filter/composite-filter.strategy';
import { TreeSortStrategyFactory } from '../../components/test-tree/strategies/sort/tree-sort-strategy.factory';
import { TestDataService } from '../../services/test-data.service';
import { signal } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    TestTree,
    TestDistributionPie,
    TestFilterInputComponent,
    LoadingComponent,
    ErrorMessageComponent,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private testDataService = inject(TestDataService);

  testData = this.testDataService.testData;

  summaryOrganizationStrategy = signal(DistributionStrategyFactory.create('status'));
  treeOrganizationStrategy = signal(TreeOrganizationStrategyFactory.create('folder'));

  filterText = signal('');
  selectedStatuses = signal<TestExecutionType[]>([]);
  filterStrategy = signal(this.createFilterStrategy('', []));
  sortStrategies = signal([TreeSortStrategyFactory.create('name')]);

  onFilterChange(filterState: FilterState): void {
    this.filterText.set(filterState.name);
    this.selectedStatuses.set(filterState.statuses);
    this.filterStrategy.set(this.createFilterStrategy(filterState.name, filterState.statuses));
  }

  private createFilterStrategy(name: string, statuses: TestExecutionType[]) {
    const filters = [];

    if (name.trim()) {
      filters.push(new NameFilterStrategy(name));
    }

    if (statuses.length > 0) {
      filters.push(new StatusFilterStrategy(statuses));
    }

    return filters.length > 0 ? new CompositeFilterStrategy(filters) : null;
  }
}
