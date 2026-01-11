import { DistributionStrategy } from './distribution-strategy.interface';
import { DistributionDataItem } from './distribution-data.interface';
import { Test, TestExecutionStatus } from '../../../../types/TestReport';
import { TestColors } from '../../../../types/Layout';
import { getLastExecution } from '../../../../utils/testExecutionUtils';

export class ExecutionTypeDistributionStrategy implements DistributionStrategy {
  calculateDistribution(tests: Test[], colors: TestColors): DistributionDataItem[] {
    const counts: Record<TestExecutionStatus, number> = {
      PASSED: 0,
      FAILED: 0,
      ERROR: 0,
      SKIPPED: 0,
    };

    tests.forEach(test => {
      const lastExecution = getLastExecution(test);
      if (lastExecution) {
        counts[lastExecution.status]++;
      }
    });

    const statusOrder: TestExecutionStatus[] = ['PASSED', 'FAILED', 'SKIPPED', 'ERROR'];
    return statusOrder
      .map(
        (executionType): DistributionDataItem => ({
          label: executionType,
          count: counts[executionType],
          color: colors[executionType],
        }),
      )
      .filter(item => item.count > 0);
  }
}
