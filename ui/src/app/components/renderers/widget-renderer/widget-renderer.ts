import { Component, computed, input } from '@angular/core';
import { DataSourceId, Widget } from '../../../types/Layout';
import { TestDistributionPie } from '../../widgets/test-distribution-pie/test-distribution-pie';
import { Test, TestReport } from '../../../types/TestReport';
import { TreeWidget } from '../../widgets/tree-widget/tree-widget';

@Component({
  selector: 'app-widget-renderer',
  imports: [TestDistributionPie, TreeWidget],
  templateUrl: './widget-renderer.html',
  styleUrl: './widget-renderer.css',
})
export class WidgetRenderer {
  widget = input.required<Widget>();
  testReports = input.required<Record<DataSourceId, TestReport>>();

  tests = computed<Test[]>(() => {
    const widget = this.widget();
    const testReports = this.testReports();
    const dataSourceId = widget.data.dataSourceId;

    const testReport = testReports[dataSourceId];
    return testReport?.tests ?? [];
  });
}
