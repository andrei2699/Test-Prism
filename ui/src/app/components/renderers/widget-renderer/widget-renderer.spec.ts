import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WidgetRenderer } from './widget-renderer';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { DataFilter, Widget } from '../../../types/Widget';
import { Test, TestReport } from '../../../types/TestReport';
import { By } from '@angular/platform-browser';

describe('WidgetRenderer', () => {
  let fixture: ComponentFixture<WidgetRenderer>;
  const tests: Test[] = [
    { name: 'Test 1', lastExecutionType: 'SUCCESS', durationMs: 100, path: 'path/to/test1' },
    { name: 'Test 2', lastExecutionType: 'FAILURE', durationMs: 200, path: 'path/to/test2' },
    {
      name: 'Another Test',
      lastExecutionType: 'SUCCESS',
      durationMs: 150,
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

  it('should filter tests based on widget data filter', () => {
    const filter: DataFilter = {
      operator: 'AND',
      conditions: [{ field: 'lastExecutionType', operator: '==', value: 'FAILURE' }],
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
});
