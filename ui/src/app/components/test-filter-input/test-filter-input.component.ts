import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-test-filter-input',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './test-filter-input.component.html',
  styleUrl: './test-filter-input.component.css',
})
export class TestFilterInputComponent {
  filterText = signal<string>('');
  filterChanged = output<string>();

  onFilterChange(): void {
    this.filterChanged.emit(this.filterText());
  }
}
