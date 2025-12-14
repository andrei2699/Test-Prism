import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { afterEach, beforeEach, describe, it, expect } from 'vitest';
import { Test } from '../../types/TestReport';
import { TestDistributionPie } from './test-distribution-pie';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { DistributionStrategyFactory } from './strategies/distribution-strategy.factory';

@Component({
  template: '<app-test-distribution-pie [tests]="tests()" [strategy]="strategy()" />',
  standalone: true,
  imports: [TestDistributionPie],
})
class TestHostComponent {
  tests = input.required<Test[]>();
  strategy = input<'execution-type'>('execution-type');
}

describe('TestDistributionPie', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideCharts(withDefaultRegisterables()), DistributionStrategyFactory],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
  });

  afterEach(() => {
    fixture.destroy();
  });

  const getChartInstance = (): BaseChartDirective => {
    const chartDirective = fixture.debugElement.query(By.directive(BaseChartDirective));
    return chartDirective.injector.get(BaseChartDirective);
  };

  it('should pass the correct data to the chart when tests are provided', () => {
    const tests: Test[] = [
      { lastExecutionType: 'SUCCESS', name: 'test1', path: '/test1' },
      { lastExecutionType: 'SUCCESS', name: 'test2', path: '/test2' },
      { lastExecutionType: 'FAILURE', name: 'test3', path: '/test3' },
      { lastExecutionType: 'SKIPPED', name: 'test4', path: '/test4' },
    ];

    fixture.componentRef.setInput('tests', tests);
    fixture.detectChanges();

    const chartInstance = getChartInstance();
    const chartData = chartInstance.data;

    expect(chartData).toBeDefined();
    expect(chartData!.labels).toEqual(['SUCCESS', 'FAILURE', 'SKIPPED']);
    expect(chartData!.datasets[0].data).toEqual([2, 1, 1]);
  });

  it('should pass empty data to the chart when no tests are provided', () => {
    fixture.componentRef.setInput('tests', []);
    fixture.detectChanges();

    const chartInstance = getChartInstance();
    const chartData = chartInstance.data;

    expect(chartData).toBeDefined();
    expect(chartData!.labels).toEqual([]);
    expect(chartData!.datasets[0].data).toEqual([]);
  });

  it('should only include statuses that have tests', () => {
    const tests: Test[] = [
      { lastExecutionType: 'SUCCESS', name: 'test1', path: '/test1' },
      { lastExecutionType: 'SUCCESS', name: 'test2', path: '/test2' },
    ];

    fixture.componentRef.setInput('tests', tests);
    fixture.detectChanges();

    const chartInstance = getChartInstance();
    const chartData = chartInstance.data;

    expect(chartData).toBeDefined();
    expect(chartData!.labels).toEqual(['SUCCESS']);
    expect(chartData!.datasets[0].data).toEqual([2]);
  });

  it('should render statuses in a consistent order', () => {
    const tests: Test[] = [
      { lastExecutionType: 'SKIPPED', name: 'test1', path: '/test1' },
      { lastExecutionType: 'ERROR', name: 'test2', path: '/test2' },
      { lastExecutionType: 'SUCCESS', name: 'test3', path: '/test3' },
      { lastExecutionType: 'FAILURE', name: 'test4', path: '/test4' },
    ];

    fixture.componentRef.setInput('tests', tests);
    fixture.detectChanges();

    const chartInstance = getChartInstance();
    const chartData = chartInstance.data;

    expect(chartData).toBeDefined();
    expect(chartData!.labels).toEqual(['SUCCESS', 'FAILURE', 'SKIPPED', 'ERROR']);
    expect(chartData!.datasets[0].data).toEqual([1, 1, 1, 1]);
  });
});
