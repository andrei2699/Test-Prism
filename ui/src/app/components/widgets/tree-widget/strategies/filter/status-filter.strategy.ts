import { Test, TestExecutionType } from '../../../../../types/TestReport';
import { TestFilterStrategy } from './test-filter-strategy.interface';
import { getLastExecution } from '../../../../../utils/testExecutionUtils';

export class StatusFilterStrategy implements TestFilterStrategy {
  private readonly statuses: Set<TestExecutionType>;

  constructor(selectedStatuses: TestExecutionType[]) {
    this.statuses = new Set(selectedStatuses);
  }

  filter(tests: Test[]): Test[] {
    if (this.statuses.size === 0) {
      return tests;
    }

    return tests.filter(test => {
      const lastExecution = getLastExecution(test);
      return lastExecution && this.statuses.has(lastExecution.status);
    });
  }
}
