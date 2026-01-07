import { Test, TestExecutionType } from '../../../../../types/TestReport';
import { TestFilterStrategy } from './test-filter-strategy.interface';

export class StatusFilterStrategy implements TestFilterStrategy {
  private readonly statuses: Set<TestExecutionType>;

  constructor(selectedStatuses: TestExecutionType[]) {
    this.statuses = new Set(selectedStatuses);
  }

  filter(tests: Test[]): Test[] {
    if (this.statuses.size === 0) {
      return tests;
    }

    return tests.filter(test => this.statuses.has(test.lastExecutionType));
  }
}
