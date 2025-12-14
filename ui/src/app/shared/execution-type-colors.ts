import { TestExecutionType } from '../types/TestReport';

export const EXECUTION_TYPE_COLORS: Record<TestExecutionType, string> = {
  SUCCESS: '#4caf50',
  FAILURE: '#f44336',
  ERROR: '#ff9800',
  SKIPPED: '#9e9e9e',
};
