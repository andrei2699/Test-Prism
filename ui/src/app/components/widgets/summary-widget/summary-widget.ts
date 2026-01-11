import { Component, computed, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { DatePipe } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { Test } from '../../../types/TestReport';
import { TestColors } from '../../../types/Layout';
import { getLastExecution } from '../../../utils/testExecutionUtils';

export interface SummaryWidgetParameters {
  title: string;
}

@Component({
  selector: 'app-summary-widget',
  templateUrl: './summary-widget.html',
  styleUrls: ['./summary-widget.css'],
  imports: [MatCardModule, DatePipe, MatChipsModule],
})
export class SummaryWidgetComponent {
  colors = input.required<TestColors>();
  tests = input.required<Test[]>();
  date = input.required<string | null>();
  parameters = input<SummaryWidgetParameters>();

  title = computed(() => this.parameters()?.title || 'Analysis Summary');

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
        case 'SUCCESS':
          summary.passed++;
          break;
        case 'FAILURE':
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
