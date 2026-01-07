import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageRenderer } from './page-renderer';
import { Page, Widget } from '../../../types/Layout';
import { Test } from '../../../types/TestReport';
import { By } from '@angular/platform-browser';
import { WidgetRenderer } from '../widget-renderer/widget-renderer';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

describe('PageRenderer', () => {
  let fixture: ComponentFixture<PageRenderer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageRenderer],
      providers: [provideCharts(withDefaultRegisterables())],
    }).compileComponents();

    fixture = TestBed.createComponent(PageRenderer);
  });

  it('should render a page with a single widget', async () => {
    const widget: Widget = {
      id: 'test-widget',
      type: 'distribution-pie',
      data: {
        dataSourceId: 'id',
      },
    };
    const page: Page = {
      title: 'title',
      path: 'path',
      widgets: [widget],
    };
    const tests: Test[] = [
      {
        lastExecutionType: 'SUCCESS',
        path: 'path',
        name: 'name',
        durationMs: 2,
      },
    ];

    fixture.componentRef.setInput('page', page);
    fixture.componentRef.setInput('tests', tests);
    fixture.detectChanges();
    await fixture.whenStable();

    const widgetElement = fixture.debugElement.query(By.directive(WidgetRenderer));
    expect(widgetElement).toBeTruthy();
  });
});
