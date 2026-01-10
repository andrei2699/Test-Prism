import { Component, EventEmitter, input, Output, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'app-tag-filter-input',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatChipsModule,
    MatIconModule,
    MatAutocompleteModule,
    AsyncPipe,
  ],
  templateUrl: './tag-filter-input.component.html',
  styleUrl: './tag-filter-input.component.css',
})
export class TagFilterInputComponent {
  allTags = input.required<string[]>();
  @Output() tagsChanged = new EventEmitter<string[]>();

  tagCtrl = new FormControl();
  filteredTags: Observable<string[]>;
  selectedTags = signal<string[]>([]);

  constructor() {
    this.filteredTags = this.tagCtrl.valueChanges.pipe(
      startWith(null),
      map((tag: string | null) => (tag ? this._filter(tag) : this.allTags().slice())),
    );
  }

  add(tag: string): void {
    const value = (tag || '').trim();
    if (value && !this.selectedTags().includes(value)) {
      this.selectedTags.update(tags => [...tags, value]);
      this.tagsChanged.emit(this.selectedTags());
    }
    this.tagCtrl.setValue(null);
  }

  remove(tag: string): void {
    this.selectedTags.update(tags => tags.filter(t => t !== tag));
    this.tagsChanged.emit(this.selectedTags());
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allTags().filter(tag => tag.toLowerCase().includes(filterValue));
  }
}
