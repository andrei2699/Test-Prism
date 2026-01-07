import { Component, input, signal } from '@angular/core';
import {
  FilterState,
  TestFilterInputComponent,
} from './test-filter-input/test-filter-input.component';
import { TestTree } from './test-tree/test-tree';
import { Test, TestExecutionType } from '../../../types/TestReport';
import { TreeSortStrategyFactory } from './strategies/sort/tree-sort-strategy.factory';
import { NameFilterStrategy } from './strategies/filter/name-filter.strategy';
import { StatusFilterStrategy } from './strategies/filter/status-filter.strategy';
import { CompositeFilterStrategy } from './strategies/filter/composite-filter.strategy';
import { TreeOrganizationStrategyFactory } from './strategies/organization/tree-organization-strategy.factory';

@Component({
  selector: 'app-tree-widget',
  imports: [TestFilterInputComponent, TestTree],
  templateUrl: './tree-widget.html',
  styleUrl: './tree-widget.css',
})
export class TreeWidget {
  tests = input.required<Test[]>();

  filterText = signal('');
  selectedStatuses = signal<TestExecutionType[]>([]);
  filterStrategy = signal(this.createFilterStrategy('', []));
  treeOrganizationStrategy = signal(TreeOrganizationStrategyFactory.create('folder'));
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
