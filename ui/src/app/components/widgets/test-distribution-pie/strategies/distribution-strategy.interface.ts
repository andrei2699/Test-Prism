import { Test } from '../../../../types/TestReport';
import { DistributionDataItem } from './distribution-data.interface';

export interface DistributionStrategy {
  calculateDistribution(tests: Test[]): DistributionDataItem[];
}
