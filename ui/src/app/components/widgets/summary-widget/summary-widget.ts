import { Component, computed, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { DatePipe, NgStyle } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { Test } from '../../../types/TestReport';
import { TestColors } from '../../../types/Layout';
import { getLastExecution } from '../../../utils/testExecutionUtils';
import { TestDistributionPie } from '../test-distribution-pie-widget/test-distribution-pie/test-distribution-pie';
import { DistributionStrategy } from '../test-distribution-pie-widget/strategies/distribution-strategy.interface';
import { DistributionStrategyFactory } from '../test-distribution-pie-widget/strategies/distribution-strategy.factory';
import { PieLegendParameters } from '../test-distribution-pie-widget/parameters/LegendParameters';
import { PieDatasetParameters } from '../test-distribution-pie-widget/parameters/DataSetParameters';
import { PieOptionsParameters } from '../test-distribution-pie-widget/parameters/OptionsParameters';

export interface SummaryWidgetParameters {
  title?: string;
  displayType?: 'chips' | 'pie';
  width?: string;
  height?: string;
  align?: 'left' | 'center' | 'right';
  styles?: Record<string, string>;
  pie?: {
    legend?: PieLegendParameters;
    options?: PieOptionsParameters;
    dataset?: PieDatasetParameters;
    shouldDisplayInnerPercentage?: boolean;
  };
}

@Component({
  selector: 'app-summary-widget',
  templateUrl: './summary-widget.html',
  styleUrls: ['./summary-widget.css'],
  imports: [MatCardModule, DatePipe, NgStyle, MatChipsModule, TestDistributionPie],
})
export class SummaryWidgetComponent {
  colors = input.required<TestColors>();
  tests = input.required<Test[]>();
  timestamp = input.required<string | null>();
  parameters = input<SummaryWidgetParameters>();

  title = computed(() => this.parameters()?.title || 'Analysis Summary');
  displayType = computed(() => this.parameters()?.displayType || 'pie');
  width = computed(() => this.parameters()?.width || '400px');
  height = computed(() => this.parameters()?.height || 'auto');
  align = computed(() => this.parameters()?.align || 'left');
  justifyContent = computed(() => {
    const alignment = this.align();
    if (alignment === 'left') {
      return 'flex-start';
    }
    if (alignment === 'right') {
      return 'flex-end';
    }
    return 'center';
  });
  styles = computed(() => this.parameters()?.styles || {});

  pieStrategy = computed<DistributionStrategy>(() => {
    return DistributionStrategyFactory.create('status');
  });

  pieLegend = computed<PieLegendParameters>(() => {
    return {
      position: 'right',
      ...this.parameters()?.pie?.legend,
    };
  });

  pieDataset = computed<PieDatasetParameters>(() => {
    return {
      borderColor: '#fff',
      borderWidth: 2,
      ...this.parameters()?.pie?.dataset,
    };
  });

  pieOptions = computed<PieOptionsParameters>(() => {
    return {
      layout: {
        padding: {
          top: 10,
          bottom: 10,
          left: 10,
          right: 15,
        },
      },
      ...this.parameters()?.pie?.options,
    };
  });

  pieShouldDisplayInnerPercentage = computed<boolean | undefined>(() => {
    return this.parameters()?.pie?.shouldDisplayInnerPercentage;
  });

  summary = computed(() => {
    const tests = this.tests();
    const summary = {
      total: tests.length,
      passed: 0,
      failed: 0,
      skipped: 0,
      error: 0,
    };

    for (const test of tests) {
      const lastExecution = getLastExecution(test);
      if (!lastExecution) {
        continue;
      }

      switch (lastExecution.status) {
        case 'PASSED':
          summary.passed++;
          break;
        case 'FAILED':
          summary.failed++;
          break;
        case 'SKIPPED':
          summary.skipped++;
          break;
        case 'ERROR':
          summary.error++;
          break;
      }
    }

    return summary;
  });
}
