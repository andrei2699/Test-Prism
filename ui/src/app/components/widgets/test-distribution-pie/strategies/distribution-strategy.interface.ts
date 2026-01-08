import { Test } from '../../../../types/TestReport';
import { DistributionDataItem } from './distribution-data.interface';
import { TestColors } from '../../../../types/Layout';

export interface DistributionStrategy {
  calculateDistribution(tests: Test[], colors: TestColors): DistributionDataItem[];
}
