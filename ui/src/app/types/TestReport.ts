export interface TestReport {
  version: number;
  timestamp: string;
  tests: Test[];
}

export interface Test {
  name: string;
  path: string;
  executions: TestExecution[];
  tags?: string[];
}

export interface TestExecution {
  timestamp: string;
  status: TestExecutionStatus;
  durationMs: number;
}

export type TestExecutionStatus = 'PASSED' | 'FAILED' | 'SKIPPED' | 'ERROR';
