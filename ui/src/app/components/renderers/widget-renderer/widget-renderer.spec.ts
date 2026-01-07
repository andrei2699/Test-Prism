import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetRenderer } from './widget-renderer';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { Widget } from '../../../types/Layout';
import { Test } from '../../../types/TestReport';
import { By } from '@angular/platform-browser';

describe('WidgetRenderer', () => {
  let fixture: ComponentFixture<WidgetRenderer>;
  const tests: Test[] = [
    {
      lastExecutionType: 'SUCCESS',
      path: 'path',
      name: 'name',
      durationMs: 2,
    },
  ];

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
    fixture.componentRef.setInput('tests', tests);
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
    fixture.componentRef.setInput('tests', tests);
    fixture.detectChanges();
    await fixture.whenStable();

    const treeElement = fixture.debugElement.query(By.css('app-test-tree'));
    expect(treeElement).toBeTruthy();
  });
});
