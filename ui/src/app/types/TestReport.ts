export interface TestReport {
  version: number;
  timestamp: string;
  tests: Test[];
}

export interface Test {
  name: string;
  file?: string;
  path: string | string[];
  executions: TestExecution[];
  tags?: string[];
}

export interface TestExecution {
  timestamp: string;
  status: TestExecutionStatus;
  durationMs: number;
  message?: string;
  consoleOutput?: string;
}

export type TestExecutionStatus = 'PASSED' | 'FAILED' | 'SKIPPED' | 'ERROR';
