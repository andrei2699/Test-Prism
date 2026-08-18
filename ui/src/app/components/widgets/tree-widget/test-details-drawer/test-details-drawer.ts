import { Component, computed, inject, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { Test, TestExecution } from '../../../../types/TestReport';
import { HumanizeDurationPipe } from '../../../../pipes/humanize-duration.pipe';
import { TestColors } from '../../../../types/Layout';
import { getLastExecution } from '../../../../utils/testExecutionUtils';
import { getPathParts } from '../../../../utils/pathUtils';
import { ConsoleOutputDialog } from './console-output-dialog/console-output-dialog';

@Component({
  selector: 'app-test-details-drawer',
  imports: [MatButtonModule, MatIconModule, MatChipsModule, HumanizeDurationPipe, DatePipe],
  templateUrl: './test-details-drawer.html',
  styleUrl: './test-details-drawer.css',
})
export class TestDetailsDrawer {
  private readonly dialog = inject(MatDialog);

  test = input.required<Test>();
  colors = input.required<TestColors>();
  close = output<void>();

  lastExecution = computed(() => getLastExecution(this.test()));

  pathParts = computed<string[]>(() => getPathParts(this.test().path));

  sortedExecutions = computed<TestExecution[]>(() =>
    this.test()
      .executions.slice()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
  );

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

  private readonly expandedConsoleOutputTimestamps = signal<Set<string>>(new Set());

  isConsoleOutputExpanded(timestamp: string): boolean {
    return this.expandedConsoleOutputTimestamps().has(timestamp);
  }

  toggleConsoleOutput(timestamp: string): void {
    this.expandedConsoleOutputTimestamps.update(set => {
      const next = new Set(set);
      if (next.has(timestamp)) {
        next.delete(timestamp);
      } else {
        next.add(timestamp);
      }
      return next;
    });
  }

  openConsoleOutputDialog(execution: TestExecution): void {
    this.dialog.open(ConsoleOutputDialog, {
      data: { timestamp: execution.timestamp, consoleOutput: execution.consoleOutput },
      width: '80vw',
      maxWidth: '1100px',
      height: '80vh',
    });
  }
}
