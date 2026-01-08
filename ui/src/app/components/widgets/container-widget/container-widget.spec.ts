import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContainerWidget } from './container-widget';
import { Widget } from '../../../types/Widget';
import { Component, input } from '@angular/core';
import { DataSourceId } from '../../../types/DataSource';
import { TestReport } from '../../../types/TestReport';
import { WidgetRenderer } from '../../renderers/widget-renderer/widget-renderer';

@Component({
  selector: 'app-widget-renderer',
  template: '<div>{{widget().id}}</div>',
  standalone: true,
})
class MockWidgetRenderer {
  widget = input.required<Widget>();
  testReports = input.required<Record<DataSourceId, TestReport>>();
}

describe('ContainerWidget', () => {
  let component: ContainerWidget;
  let fixture: ComponentFixture<ContainerWidget>;

  const mockTestReports: Record<DataSourceId, TestReport> = {
    '1': {
      date: '2025-01-01T00:00:00.000Z',
      version: 0,
      tests: [],
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContainerWidget],
    })
      .overrideComponent(ContainerWidget, {
        remove: {
          imports: [WidgetRenderer],
        },
        add: {
          imports: [MockWidgetRenderer],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ContainerWidget);
    component = fixture.componentInstance;
  });

  it('should render all its children', () => {
    const children: Widget[] = [
      { id: 'child1', type: 'tree', data: { dataSourceId: '1' } },
      { id: 'child2', type: 'distribution-pie', data: { dataSourceId: '1' } },
    ];
    fixture.componentRef.setInput('children', children);
    fixture.componentRef.setInput('testReports', mockTestReports);
    fixture.detectChanges();

    const childNodes = fixture.nativeElement.querySelectorAll('app-widget-renderer');
    expect(childNodes.length).toBe(2);
    expect(childNodes[0].textContent).toBe('child1');
    expect(childNodes[1].textContent).toBe('child2');
  });
});
