import { Component, forwardRef, input } from '@angular/core';
import { Widget } from '../../../types/Widget';
import { WidgetRenderer } from '../../renderers/widget-renderer/widget-renderer';
import { TestReport } from '../../../types/TestReport';
import { DataSourceId } from '../../../types/DataSource';
import { TestColors } from '../../../types/Layout';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-container-widget',
  imports: [forwardRef(() => WidgetRenderer), NgStyle],
  templateUrl: './container-widget.html',
  styleUrl: './container-widget.css',
})
export class ContainerWidget {
  colors = input.required<TestColors>();
  children = input.required<Widget[]>();
  testReports = input.required<Record<DataSourceId, TestReport>>();
  style = input<Partial<CSSStyleDeclaration>>();
}
