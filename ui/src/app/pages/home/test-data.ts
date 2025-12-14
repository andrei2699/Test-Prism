import { TestReport } from '../../types/TestReport';

const paths = [
  'src/app/components/navbar',
  'src/app/components/test-tree',
  'src/app/components/test-tree/utils',
  'src/app/components/modal/unit',
  'src/app/components/modal/integration',
  'src/app/pages/home',
  'src/app/pages/login',
  'src/app/pages/dashboard',
  'src/app/pages/reports',
  'src/app/pages/settings',
  'src/app/services/auth',
  'src/app/services/test-report',
  'src/app/services/test-report/statistics',
  'src/app/services/notification',
  'src/app/services/storage',
  'src/app/services/logger',
  'src/app/guards/auth',
  'src/app/guards/role',
  'src/app/interceptors/http',
  'src/app/interceptors/error',
  'src/app/pipes/date-format',
  'src/app/pipes/size-format',
  'src/app/pipes/truncate',
  'src/app/directives/number-input',
  'src/app/directives/highlight',
  'src/app/directives/debounce',
  'src/app/directives/throttle',
  'src/app/validators',
  'src/app/forms/builders',
  'src/app/forms/login',
  'src/app/forms/register',
  'src/app/utils/string',
  'src/app/utils/array',
  'src/app/utils/date',
  'src/app/utils/number',
  'src/app/shared/list',
  'src/app/shared/table',
  'src/app/shared/card',
  'src/app/shared/button',
  'src/app/shared/input',
];

const testNames = [
  'should initialize',
  'should render',
  'should handle click',
  'should validate',
  'should submit',
  'should display',
  'should load data',
  'should update state',
  'should emit event',
  'should navigate',
  'should filter',
  'should sort',
  'should paginate',
  'should cache',
  'should handle error',
  'should refresh',
  'should delete',
  'should create',
  'should edit',
  'should transform data',
];

const executionTypes = [
  'SUCCESS' as const,
  'SUCCESS' as const,
  'SUCCESS' as const,
  'SUCCESS' as const,
  'SUCCESS' as const,
  'SUCCESS' as const,
  'SUCCESS' as const,
  'FAILURE' as const,
  'SKIPPED' as const,
  'ERROR' as const,
];

function generateTestData(): TestReport {
  const tests = [];

  for (let i = 0; i < 10000; i++) {
    const path = paths[i % paths.length];
    const testName = testNames[i % testNames.length];
    const executionType = executionTypes[i % executionTypes.length];
    const durationMs = Math.floor(Math.random() * 4900) + 100;

    tests.push({
      name: `${testName} #${i}`,
      path: `/${path}`,
      lastExecutionType: executionType,
      durationMs,
    });
  }

  return {
    version: 1,
    date: new Date(),
    tests,
  };
}

export const LARGE_TEST_DATA = generateTestData();
