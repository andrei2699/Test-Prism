export interface TestReport {
  version: number;
  date: Date;
  tests: Test[];
}

export interface Test {
  lastExecutionType: TestExecutionType;
  name: string;
  path: string;
  durationMs?: number;
}

export type TestExecutionType = 'SUCCESS' | 'FAILURE' | 'SKIPPED' | 'ERROR';
