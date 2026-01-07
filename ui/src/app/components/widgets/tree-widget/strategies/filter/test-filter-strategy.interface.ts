import { Test } from '../../../../../types/TestReport';

export interface TestFilterStrategy {
  filter(tests: Test[]): Test[];
}
