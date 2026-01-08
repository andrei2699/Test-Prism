import { Component, input } from '@angular/core';
import { Widget } from '../../../types/Widget';
import { WidgetRenderer } from '../../renderers/widget-renderer/widget-renderer';
import { TestReport } from '../../../types/TestReport';
import { DataSourceId } from '../../../types/DataSource';

@Component({
  selector: 'app-container-widget',
  imports: [WidgetRenderer],
  templateUrl: './container-widget.html',
  styleUrl: './container-widget.css',
})
export class ContainerWidget {
  children = input.required<Widget[]>();
  testReports = input.required<Record<DataSourceId, TestReport>>();
}
