import { Component, computed, inject, input } from '@angular/core';
import { TestDistributionPie } from '../../widgets/test-distribution-pie/test-distribution-pie';
import { Test, TestReport } from '../../../types/TestReport';
import { TreeWidget } from '../../widgets/tree-widget/tree-widget';
import { DataSourceId } from '../../../types/DataSource';
import { Widget } from '../../../types/Widget';
import { DataFilterService } from '../../../services/data-filter.service';

@Component({
  selector: 'app-widget-renderer',
  imports: [TestDistributionPie, TreeWidget],
  templateUrl: './widget-renderer.html',
  styleUrl: './widget-renderer.css',
})
export class WidgetRenderer {
  widget = input.required<Widget>();
  testReports = input.required<Record<DataSourceId, TestReport>>();

  private dataFilterService = inject(DataFilterService);

  tests = computed<Test[]>(() => {
    const widget = this.widget();
    const testReports = this.testReports();
    const dataSourceId = widget.data.dataSourceId;
    const testReport = testReports[dataSourceId];
    const tests = testReport?.tests ?? [];

    if (widget.data.filter) {
      return this.dataFilterService.applyFilter(tests, widget.data.filter);
    }

    return tests;
  });
}
