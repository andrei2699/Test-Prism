import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WidgetRenderer } from './widget-renderer';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { DataFilter, Widget } from '../../../types/Widget';
import { Test, TestReport } from '../../../types/TestReport';
import { By } from '@angular/platform-browser';
import { TestColors } from '../../../types/Layout';

describe('WidgetRenderer', () => {
  let fixture: ComponentFixture<WidgetRenderer>;
  const tests: Test[] = [
    {
      name: 'Test 1',
      executions: [
        {
          timestamp: '2023-01-01T00:00:00Z',
          status: 'SUCCESS',
          durationMs: 100,
        },
      ],
      path: 'path/to/test1',
    },
    {
      name: 'Test 2',
      executions: [
        {
          timestamp: '2023-01-01T00:00:00Z',
          status: 'FAILURE',
          durationMs: 200,
        },
      ],
      path: 'path/to/test2',
    },
    {
      name: 'Another Test',
      executions: [
        {
          timestamp: '2023-01-01T00:00:00Z',
          status: 'SUCCESS',
          durationMs: 150,
        },
      ],
      path: 'path/to/another',
    },
  ];

  const testReports: Record<string, TestReport> = {
    id: { tests: tests, version: 0, date: '2025-01-01T00:00:00Z' },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WidgetRenderer],
      providers: [provideCharts(withDefaultRegisterables())],
    }).compileComponents();

    fixture = TestBed.createComponent(WidgetRenderer);
    fixture.componentRef.setInput('colors', {
      SUCCESS: 'green',
      FAILURE: 'red',
      SKIPPED: 'yellow',
      ERROR: 'orange',
    } satisfies TestColors);
  });

  it('should render test distribution pie widget', async () => {
    const widget: Widget = {
      id: 'test-widget',
      type: 'distribution-pie',
      data: {
        dataSourceId: 'id',
      },
    };

    fixture.componentRef.setInput('widget', widget);
    fixture.componentRef.setInput('testReports', testReports);
    fixture.detectChanges();
    await fixture.whenStable();

    const pieElement = fixture.debugElement.query(By.css('app-test-distribution-pie'));
    expect(pieElement).toBeTruthy();
  });

  it('should render test tree widget', async () => {
    const widget: Widget = {
      id: 'test-widget',
      type: 'tree',
      data: {
        dataSourceId: 'id',
      },
    };

    fixture.componentRef.setInput('widget', widget);
    fixture.componentRef.setInput('testReports', testReports);
    fixture.detectChanges();
    await fixture.whenStable();

    const treeElement = fixture.debugElement.query(By.css('app-tree-widget'));
    expect(treeElement).toBeTruthy();
  });

  it('should render summary widget', async () => {
    const widget: Widget = {
      id: 'test-widget',
      type: 'summary',
      data: {
        dataSourceId: 'id',
      },
    };

    fixture.componentRef.setInput('widget', widget);
    fixture.componentRef.setInput('testReports', testReports);
    fixture.detectChanges();
    await fixture.whenStable();

    const summaryElement = fixture.debugElement.query(By.css('app-summary-widget'));
    expect(summaryElement).toBeTruthy();
  });

  it('should filter tests based on widget data filter', () => {
    const filter: DataFilter = {
      operator: 'AND',
      conditions: [{ field: 'executions.status', operator: '==', value: 'FAILURE' }],
    };

    const widget: Widget = {
      id: 'test-widget',
      type: 'tree',
      data: {
        dataSourceId: 'id',
        filter: filter,
      },
    };

    fixture.componentRef.setInput('widget', widget);
    fixture.componentRef.setInput('testReports', testReports);
    fixture.detectChanges();

    expect(fixture.componentInstance.tests().length).toBe(1);
    expect(fixture.componentInstance.tests()[0].name).toBe('Test 2');
  });

  it('should apply style to the widget container', () => {
    const widget: Widget = {
      id: 'test-widget',
      type: 'tree',
      data: {
        dataSourceId: 'id',
      },
      style: {
        backgroundColor: 'red',
      } as CSSStyleDeclaration,
    };

    fixture.componentRef.setInput('widget', widget);
    fixture.componentRef.setInput('testReports', testReports);
    fixture.detectChanges();

    const container = fixture.debugElement.query(By.css('div'));
    expect(container.nativeElement.style.backgroundColor).toBe('red');
  });
});
