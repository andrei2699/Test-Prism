import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageRenderer } from './page-renderer';
import { Page, Widget } from '../../../types/Layout';
import { Test } from '../../../types/TestReport';
import { By } from '@angular/platform-browser';
import { WidgetRenderer } from '../widget-renderer/widget-renderer';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-widget-renderer',
  template: '<div class="mock-widget" [attr.data-widget-id]="widget.id"></div>',
  standalone: true,
})
class MockWidgetRenderer {
  @Input({ required: true }) widget!: Widget;
  @Input({ required: true }) tests!: Test[];
}

describe('PageRenderer', () => {
  let fixture: ComponentFixture<PageRenderer>;

  const mockTests: Test[] = [
    {
      lastExecutionType: 'SUCCESS',
      path: 'test/path',
      name: 'name',
      durationMs: 2,
    },
  ];

  const page1: Page = {
    title: 'Page 1',
    path: 'page1',
    widgets: [
      {
        id: 'w1',
        type: 'distribution-pie',
        data: { dataSourceId: 'id' },
      },
    ],
  };

  const page2: Page = {
    title: 'Page 2',
    path: 'Page/2',
    widgets: [
      {
        id: 'w2',
        type: 'tree',
        data: { dataSourceId: 'id' },
      },
    ],
  };

  const pages: Page[] = [page1, page2];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageRenderer],
      providers: [provideCharts(withDefaultRegisterables())],
    })
      .overrideComponent(PageRenderer, {
        remove: { imports: [WidgetRenderer] },
        add: { imports: [MockWidgetRenderer] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(PageRenderer);

    fixture.componentRef.setInput('pages', pages);
    fixture.componentRef.setInput('tests', mockTests);
  });

  it('should render the first page when path is not provided', () => {
    fixture.componentRef.setInput('path', null);
    fixture.detectChanges();

    const widgets = fixture.debugElement.queryAll(By.css('.mock-widget'));
    expect(widgets.length).toBe(1);
    expect(widgets[0].attributes['data-widget-id']).toBe('w1');
  });

  it('should render the first page when path does not match any page', () => {
    fixture.componentRef.setInput('path', 'unknown-path');
    fixture.detectChanges();

    const widgets = fixture.debugElement.queryAll(By.css('.mock-widget'));
    expect(widgets.length).toBe(1);
    expect(widgets[0].attributes['data-widget-id']).toBe('w1');
  });

  it('should render the correct page when path matches exactly', () => {
    fixture.componentRef.setInput('path', 'page1');
    fixture.detectChanges();

    const widgets = fixture.debugElement.queryAll(By.css('.mock-widget'));
    expect(widgets.length).toBe(1);
    expect(widgets[0].attributes['data-widget-id']).toBe('w1');
  });

  it('should render the correct page when path matches with normalization', () => {
    fixture.componentRef.setInput('path', 'page2');
    fixture.detectChanges();

    const widgets = fixture.debugElement.queryAll(By.css('.mock-widget'));
    expect(widgets.length).toBe(1);
    expect(widgets[0].attributes['data-widget-id']).toBe('w2');
  });

  it('should render multiple widgets for a page', () => {
    const multiWidgetPage: Page = {
      title: 'Multi',
      path: 'multi',
      widgets: [
        { id: 'mw1', type: 'distribution-pie', data: { dataSourceId: 'id' } },
        { id: 'mw2', type: 'tree', data: { dataSourceId: 'id' } },
      ],
    };
    fixture.componentRef.setInput('pages', [multiWidgetPage]);
    fixture.componentRef.setInput('path', 'multi');
    fixture.detectChanges();

    const widgets = fixture.debugElement.queryAll(By.css('.mock-widget'));
    expect(widgets.length).toBe(2);
    expect(widgets[0].attributes['data-widget-id']).toBe('mw1');
    expect(widgets[1].attributes['data-widget-id']).toBe('mw2');
  });
});
