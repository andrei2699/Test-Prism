import { Component, input } from '@angular/core';
import { Widget } from '../../../types/Layout';
import { TestDistributionPie } from '../../widgets/test-distribution-pie/test-distribution-pie';
import { Test } from '../../../types/TestReport';

@Component({
  selector: 'app-widget-renderer',
  imports: [TestDistributionPie],
  templateUrl: './widget-renderer.html',
  styleUrl: './widget-renderer.css',
})
export class WidgetRenderer {
  widget = input.required<Widget>();
  tests = input.required<Test[]>();
}
