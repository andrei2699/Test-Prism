import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TestExecutionType } from '../../../../types/TestReport';

export interface FilterState {
  name: string;
  statuses: TestExecutionType[];
  tags: string[];
}

@Component({
  selector: 'app-test-filter-input',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatCheckboxModule],
  templateUrl: './test-filter-input.component.html',
  styleUrl: './test-filter-input.component.css',
})
export class TestFilterInputComponent {
  filterText = signal<string>('');
  tagFilterText = signal<string>('');
  selectedStatuses = signal<Set<TestExecutionType>>(new Set());

  statusOptions: TestExecutionType[] = ['SUCCESS', 'FAILURE', 'SKIPPED', 'ERROR'];

  filterChanged = output<FilterState>();

  onFilterChange(): void {
    this.emitFilterState();
  }

  toggleStatus(status: TestExecutionType): void {
    const current = new Set(this.selectedStatuses());
    if (current.has(status)) {
      current.delete(status);
    } else {
      current.add(status);
    }
    this.selectedStatuses.set(current);
    this.emitFilterState();
  }

  isStatusSelected(status: TestExecutionType): boolean {
    return this.selectedStatuses().has(status);
  }

  private emitFilterState(): void {
    this.filterChanged.emit({
      name: this.filterText(),
      statuses: Array.from(this.selectedStatuses()),
      tags: this.tagFilterText()
        ? this.tagFilterText()
            .split(',')
            .map(tag => tag.trim())
        : [],
    });
  }
}
