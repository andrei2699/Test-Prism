import { DistributionStrategy } from './distribution-strategy.interface';
import { DistributionDataItem } from './distribution-data.interface';
import { Test, TestExecutionType } from '../../../../types/TestReport';
import { EXECUTION_TYPE_COLORS } from '../../../../shared/execution-type-colors';

export class ExecutionTypeDistributionStrategy implements DistributionStrategy {
  calculateDistribution(tests: Test[]): DistributionDataItem[] {
    const counts: Record<TestExecutionType, number> = {
      SUCCESS: 0,
      FAILURE: 0,
      ERROR: 0,
      SKIPPED: 0,
    };

    tests.forEach(test => {
      counts[test.lastExecutionType]++;
    });

    const statusOrder: TestExecutionType[] = ['SUCCESS', 'FAILURE', 'SKIPPED', 'ERROR'];
    return statusOrder
      .map(
        (executionType): DistributionDataItem => ({
          label: executionType,
          count: counts[executionType],
          color: EXECUTION_TYPE_COLORS[executionType],
        }),
      )
      .filter(item => item.count > 0);
  }
}
