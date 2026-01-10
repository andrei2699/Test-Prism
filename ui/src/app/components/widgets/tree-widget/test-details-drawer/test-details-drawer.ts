import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Test } from '../../../../types/TestReport';
import { HumanizeDurationPipe } from '../../../../pipes/humanize-duration.pipe';
import { TestColors } from '../../../../types/Layout';

@Component({
  selector: 'app-test-details-drawer',
  imports: [CommonModule, MatButtonModule, MatIconModule, HumanizeDurationPipe],
  templateUrl: './test-details-drawer.html',
  styleUrl: './test-details-drawer.css',
})
export class TestDetailsDrawer {
  test = input.required<Test>();
  colors = input.required<TestColors>();
  close = output<void>();

  testDuration = computed<number>(() => {
    return this.test().durationMs??0;
  })

  get statusColor(): string {
    return this.colors()[this.test().lastExecutionType] || 'inherit';
  }
}
