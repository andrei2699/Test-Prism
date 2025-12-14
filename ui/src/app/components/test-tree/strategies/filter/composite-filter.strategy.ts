import { Test } from '../../../../types/TestReport';
import { TestFilterStrategy } from './test-filter-strategy.interface';

export class CompositeFilterStrategy implements TestFilterStrategy {
  constructor(private filters: TestFilterStrategy[]) {}

  filter(tests: Test[]): Test[] {
    return this.filters.reduce((filteredTests, filter) => {
      return filter.filter(filteredTests);
    }, tests);
  }
}
