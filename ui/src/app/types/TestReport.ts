export interface TestReport {
  version: number;
  date: string;
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
  status: TestExecutionType;
  durationMs: number;
}

export type TestExecutionType = 'SUCCESS' | 'FAILURE' | 'SKIPPED' | 'ERROR';
