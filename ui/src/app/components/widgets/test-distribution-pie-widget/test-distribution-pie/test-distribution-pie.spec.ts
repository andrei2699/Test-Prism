import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TestDistributionPie } from './test-distribution-pie';
import { Test } from '../../../../types/TestReport';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { TestColors } from '../../../../types/Layout';
import { DistributionStrategyFactory } from '../strategies/distribution-strategy.factory';

describe('TestDistributionPie', () => {
  let component: TestDistributionPie;
  let fixture: ComponentFixture<TestDistributionPie>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestDistributionPie],
      providers: [provideCharts(withDefaultRegisterables())],
    }).compileComponents();

    fixture = TestBed.createComponent(TestDistributionPie);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('colors', {
      SUCCESS: 'green',
      FAILURE: 'red',
      SKIPPED: 'yellow',
      ERROR: 'orange',
    } satisfies TestColors);
  });

  const getChartInstance = (): BaseChartDirective => {
    const chartDirective = fixture.debugElement.query(By.directive(BaseChartDirective));
    return chartDirective.injector.get(BaseChartDirective);
  };

  it('should pass the correct data to the chart when tests are provided', () => {
    const tests: Test[] = [
      {
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        name: 'test1',
        path: '/test1',
      },
      {
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        name: 'test2',
        path: '/test2',
      },
      {
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'FAILURE', durationMs: 100 }],
        name: 'test3',
        path: '/test3',
      },
      {
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SKIPPED', durationMs: 100 }],
        name: 'test4',
        path: '/test4',
      },
    ];
    const strategy = DistributionStrategyFactory.create('status');

    fixture.componentRef.setInput('tests', tests);
    fixture.componentRef.setInput('strategy', strategy);
    fixture.detectChanges();

    const chartInstance = getChartInstance();
    const chartData = chartInstance.data;

    expect(chartData).toBeDefined();
    expect(chartData!.labels).toEqual(['SUCCESS (50.00%)', 'FAILURE (25.00%)', 'SKIPPED (25.00%)']);
    expect(chartData!.datasets[0].data).toEqual([2, 1, 1]);
  });

  it('should pass empty data to the chart when no tests are provided', () => {
    const strategy = DistributionStrategyFactory.create('status');
    fixture.componentRef.setInput('tests', []);
    fixture.componentRef.setInput('strategy', strategy);
    fixture.detectChanges();

    const chartInstance = getChartInstance();
    const chartData = chartInstance.data;

    expect(chartData).toBeDefined();
    expect(chartData!.labels).toEqual([]);
    expect(chartData!.datasets[0].data).toEqual([]);
  });

  it('should only include statuses that have tests', () => {
    const tests: Test[] = [
      {
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        name: 'test1',
        path: '/test1',
      },
      {
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        name: 'test2',
        path: '/test2',
      },
    ];
    const strategy = DistributionStrategyFactory.create('status');

    fixture.componentRef.setInput('tests', tests);
    fixture.componentRef.setInput('strategy', strategy);
    fixture.detectChanges();

    const chartInstance = getChartInstance();
    const chartData = chartInstance.data;

    expect(chartData).toBeDefined();
    expect(chartData!.labels).toEqual(['SUCCESS (100.00%)']);
    expect(chartData!.datasets[0].data).toEqual([2]);
  });

  it('should render statuses in a consistent order', () => {
    const tests: Test[] = [
      {
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SKIPPED', durationMs: 100 }],
        name: 'test1',
        path: '/test1',
      },
      {
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'ERROR', durationMs: 100 }],
        name: 'test2',
        path: '/test2',
      },
      {
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        name: 'test3',
        path: '/test3',
      },
      {
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'FAILURE', durationMs: 100 }],
        name: 'test4',
        path: '/test4',
      },
    ];
    const strategy = DistributionStrategyFactory.create('status');

    fixture.componentRef.setInput('tests', tests);
    fixture.componentRef.setInput('strategy', strategy);
    fixture.detectChanges();

    const chartInstance = getChartInstance();
    const chartData = chartInstance.data;

    expect(chartData).toBeDefined();
    expect(chartData!.labels).toEqual([
      'SUCCESS (25.00%)',
      'FAILURE (25.00%)',
      'SKIPPED (25.00%)',
      'ERROR (25.00%)',
    ]);
    expect(chartData!.datasets[0].data).toEqual([1, 1, 1, 1]);
  });
});
