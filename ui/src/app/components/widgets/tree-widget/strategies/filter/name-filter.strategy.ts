import { Test } from '../../../../../types/TestReport';
import { TestFilterStrategy } from './test-filter-strategy.interface';

export class NameFilterStrategy implements TestFilterStrategy {
  private readonly trimmedFilter: string;

  constructor(filterText: string) {
    this.trimmedFilter = filterText.trim();
  }

  filter(tests: Test[]): Test[] {
    if (!this.trimmedFilter) {
      return tests;
    }

    const lowerFilter = this.trimmedFilter.toLowerCase();
    return tests.filter(test => test.name.toLowerCase().includes(lowerFilter));
  }
}
