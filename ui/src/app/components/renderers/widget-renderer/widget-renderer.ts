import { Component, input } from '@angular/core';
import { Widget } from '../../../types/Layout';
import { TestDistributionPie } from '../../widgets/test-distribution-pie/test-distribution-pie';
import { Test } from '../../../types/TestReport';
import { TreeWidget } from '../../widgets/tree-widget/tree-widget';

@Component({
  selector: 'app-widget-renderer',
  imports: [TestDistributionPie, TreeWidget],
  templateUrl: './widget-renderer.html',
  styleUrl: './widget-renderer.css',
})
export class WidgetRenderer {
  widget = input.required<Widget>();
  tests = input.required<Test[]>();
}
