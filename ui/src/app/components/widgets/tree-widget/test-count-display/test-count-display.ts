import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestExecutionStatus } from '../../../../types/TestReport';
import { TestColors } from '../../../../types/Layout';

@Component({
  selector: 'app-test-count-display',
  imports: [CommonModule],
  templateUrl: './test-count-display.html',
  styleUrl: './test-count-display.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestCountDisplayComponent {
  colors = input.required<TestColors>();
  testCounts = input.required<Record<TestExecutionStatus, number>>();

  totalCount = computed<number>(() => {
    let total = 0;
    const counts = this.testCounts();
    for (const key in counts) {
      total += counts[key as TestExecutionStatus];
    }
    return total;
  });

  getExecutionTypeColor(typeKey: string): string {
    const executionType = typeKey as TestExecutionStatus;
    return this.colors()[executionType];
  }
}
