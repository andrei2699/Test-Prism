import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Test, TestExecutionType } from '../../../../types/TestReport';
import { TagFilterInputComponent } from '../tag-filter-input/tag-filter-input.component';

export interface FilterState {
  name: string;
  statuses: TestExecutionType[];
  tags: string[];
}

@Component({
  selector: 'app-test-filter-input',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    TagFilterInputComponent,
  ],
  templateUrl: './test-filter-input.component.html',
  styleUrl: './test-filter-input.component.css',
})
export class TestFilterInputComponent {
  tests = input.required<Test[]>();

  filterText = signal<string>('');
  selectedStatuses = signal<Set<TestExecutionType>>(new Set());
  selectedTags = signal<string[]>([]);

  allTags = computed(() => {
    const tags = new Set<string>();
    for (const test of this.tests()) {
      for (const tag of test.tags ?? []) {
        tags.add(tag);
      }
    }
    return Array.from(tags);
  });

  statusOptions: TestExecutionType[] = ['SUCCESS', 'FAILURE', 'SKIPPED', 'ERROR'];

  filterChanged = output<FilterState>();

  onFilterChange(): void {
    this.emitFilterState();
  }

  onTagsChanged(tags: string[]): void {
    this.selectedTags.set(tags);
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
      tags: this.selectedTags(),
    });
  }
}
