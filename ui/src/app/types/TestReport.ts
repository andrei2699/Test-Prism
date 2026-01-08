export interface TestReport {
  version: number;
  date: string;
  tests: Test[];
}

export interface Test {
  lastExecutionType: TestExecutionType;
  name: string;
  path: string;
  durationMs?: number;
  tags?: string[];
}

export type TestExecutionType = 'SUCCESS' | 'FAILURE' | 'SKIPPED' | 'ERROR';
