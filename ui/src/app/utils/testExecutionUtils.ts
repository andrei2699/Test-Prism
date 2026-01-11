import { Test, TestExecution } from '../types/TestReport';

export function getLastExecution(test: Test): TestExecution | undefined {
  if (!test.executions || test.executions.length === 0) {
    return undefined;
  }

  return test.executions
    .slice()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
}
