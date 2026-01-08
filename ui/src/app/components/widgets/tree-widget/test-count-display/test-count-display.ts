import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestExecutionType } from '../../../../types/TestReport';
import { EXECUTION_TYPE_COLORS } from '../../../../shared/execution-type-colors';

@Component({
  selector: 'app-test-count-display',
  imports: [CommonModule],
  templateUrl: './test-count-display.html',
  styleUrl: './test-count-display.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestCountDisplayComponent {
  testCounts = input.required<Record<TestExecutionType, number>>();

  totalCount = computed<number>(() => {
    let total = 0;
    const counts = this.testCounts();
    for (const key in counts) {
      total += counts[key as TestExecutionType];
    }
    return total;
  });

  protected readonly EXECUTION_TYPE_COLORS = EXECUTION_TYPE_COLORS;

  getExecutionTypeColor(typeKey: string): string {
    const executionType = typeKey as TestExecutionType;
    return this.EXECUTION_TYPE_COLORS[executionType];
  }
}
