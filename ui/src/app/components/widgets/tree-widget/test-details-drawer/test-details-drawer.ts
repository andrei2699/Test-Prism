import { Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Test } from '../../../../types/TestReport';
import { HumanizeDurationPipe } from '../../../../pipes/humanize-duration.pipe';
import { TestColors } from '../../../../types/Layout';
import { getLastExecution } from '../../../../utils/testExecutionUtils';

@Component({
  selector: 'app-test-details-drawer',
  imports: [MatButtonModule, MatIconModule, MatChipsModule, HumanizeDurationPipe],
  templateUrl: './test-details-drawer.html',
  styleUrl: './test-details-drawer.css',
})
export class TestDetailsDrawer {
  test = input.required<Test>();
  colors = input.required<TestColors>();
  close = output<void>();

  lastExecution = computed(() => getLastExecution(this.test()));

  testDuration = computed<number>(() => {
    return this.lastExecution()?.durationMs ?? 0;
  });

  statusColor = computed<string>(() => {
    const lastExecution = this.lastExecution();
    if (!lastExecution) {
      return 'inherit';
    }
    return this.colors()[lastExecution.status] || 'inherit';
  });
}
