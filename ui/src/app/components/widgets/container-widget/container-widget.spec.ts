import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContainerWidget } from './container-widget';
import { Widget } from '../../../types/Widget';
import { DataSourceId } from '../../../types/DataSource';
import { TestReport } from '../../../types/TestReport';
import { WidgetRenderer } from '../../renderers/widget-renderer/widget-renderer';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { TestColors } from '../../../types/Layout';

describe('ContainerWidget', () => {
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
      imports: [ContainerWidget, WidgetRenderer],
      providers: [provideCharts(withDefaultRegisterables())],
    }).compileComponents();

    fixture = TestBed.createComponent(ContainerWidget);
    fixture.componentRef.setInput('colors', {
      SUCCESS: 'green',
      FAILURE: 'red',
      SKIPPED: 'yellow',
      ERROR: 'orange',
    } satisfies TestColors);
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
  });
});
