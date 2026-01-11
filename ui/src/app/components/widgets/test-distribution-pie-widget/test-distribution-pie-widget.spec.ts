import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  TestDistributionPieWidget,
  TestDistributionPieParameters,
} from './test-distribution-pie-widget';
import { Test } from '../../../types/TestReport';
import { TestColors } from '../../../types/Layout';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

const tests: Test[] = [
  {
    name: 'should display a success message',
    executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 100 }],
    path: 'Login.UI',
    tags: ['UI', 'Login'],
  },
  {
    name: 'should display an error message on failed login',
    executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'FAILED', durationMs: 200 }],
    path: 'Login.UI',
    tags: ['UI', 'Login'],
  },
  {
    name: 'should fetch user data',
    executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 300 }],
    path: 'User.API',
    tags: ['API', 'User'],
  },
  {
    name: 'should timeout when fetching user data',
    executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SKIPPED', durationMs: 0 }],
    path: 'User.API',
    tags: ['API', 'User'],
  },
];

const colors: TestColors = {
  PASSED: 'green',
  FAILED: 'red',
  SKIPPED: 'yellow',
  ERROR: 'orange',
};

describe('TestDistributionPieWidget', () => {
  let component: TestDistributionPieWidget;
  let fixture: ComponentFixture<TestDistributionPieWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestDistributionPieWidget],
      providers: [provideCharts(withDefaultRegisterables())],
    }).compileComponents();

    fixture = TestBed.createComponent(TestDistributionPieWidget);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('tests', tests);
    fixture.componentRef.setInput('colors', colors);
  });

  it('should not display a title when not provided', () => {
    const parameters: TestDistributionPieParameters = {
      strategy: 'status',
    };
    fixture.componentRef.setInput('parameters', parameters);
    fixture.detectChanges();

    const titleElement = fixture.nativeElement.querySelector('h2');
    expect(titleElement).toBeNull();
  });

  it('should display a title when provided', () => {
    const parameters: TestDistributionPieParameters = {
      strategy: 'status',
      title: 'Test Title',
    };
    fixture.componentRef.setInput('parameters', parameters);
    fixture.detectChanges();

    const titleElement = fixture.nativeElement.querySelector('h2');
    expect(titleElement).not.toBeNull();
    expect(titleElement.textContent).toBe('Test Title');
  });

  it('should create a status distribution strategy', () => {
    const parameters: TestDistributionPieParameters = {
      strategy: 'status',
    };
    fixture.componentRef.setInput('parameters', parameters);
    fixture.detectChanges();

    const strategy = component.strategy();
    const distribution = strategy.calculateDistribution(tests, colors);
    expect(distribution).toEqual([
      { label: 'PASSED', count: 2, color: 'green' },
      { label: 'FAILED', count: 1, color: 'red' },
      { label: 'SKIPPED', count: 1, color: 'yellow' },
    ]);
  });

  it('should create a duration distribution strategy', () => {
    const parameters: TestDistributionPieParameters = {
      strategy: 'duration',
      strategyParameters: {
        intervals: [
          { min: 0, max: 150, color: 'blue' },
          { min: 150, max: 250, color: 'purple' },
          { min: 250, color: 'pink' },
        ],
      },
    };
    fixture.componentRef.setInput('parameters', parameters);
    fixture.detectChanges();

    const strategy = component.strategy();
    const distribution = strategy.calculateDistribution(tests, colors);
    expect(distribution).toEqual([
      { label: '0 seconds - 0.15 seconds', count: 2, color: 'blue' },
      { label: '0.15 seconds - 0.25 seconds', count: 1, color: 'purple' },
      { label: 'Over 0.25 seconds', count: 1, color: 'pink' },
    ]);
  });
});
