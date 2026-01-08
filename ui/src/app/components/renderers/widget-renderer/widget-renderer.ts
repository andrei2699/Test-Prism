import { Component, computed, forwardRef, inject, input } from '@angular/core';
import { TestDistributionPie } from '../../widgets/test-distribution-pie/test-distribution-pie';
import { Test, TestReport } from '../../../types/TestReport';
import { TreeWidget } from '../../widgets/tree-widget/tree-widget';
import { DataSourceId } from '../../../types/DataSource';
import { Widget } from '../../../types/Widget';
import { DataFilterService } from '../../../services/data-filter.service';
import { ContainerWidget } from '../../widgets/container-widget/container-widget';
import { NgStyle } from '@angular/common';
import { SummaryWidgetComponent } from '../../widgets/summary-widget/summary-widget';
import { TestColors } from '../../../types/Layout';

@Component({
  selector: 'app-widget-renderer',
  imports: [
    TestDistributionPie,
    TreeWidget,
    forwardRef(() => ContainerWidget),
    NgStyle,
    SummaryWidgetComponent,
  ],
  templateUrl: './widget-renderer.html',
  styleUrl: './widget-renderer.css',
})
export class WidgetRenderer {
  colors = input.required<TestColors>();
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

  date = computed<string | null>(() => {
    const widget = this.widget();
    const testReports = this.testReports();

    const dataSourceId = widget.data.dataSourceId;
    const testReport = testReports[dataSourceId];

    return testReport?.date;
  });
}
