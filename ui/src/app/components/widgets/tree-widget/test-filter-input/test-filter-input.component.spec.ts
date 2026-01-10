import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestFilterInputComponent } from './test-filter-input.component';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { vi } from 'vitest';

describe('TestFilterInputComponent', () => {
  let component: TestFilterInputComponent;
  let fixture: ComponentFixture<TestFilterInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestFilterInputComponent, FormsModule, MatFormFieldModule, MatInputModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TestFilterInputComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('tests', []);
    fixture.detectChanges();
  });

  it('should emit filterChanged event when filter text changes', () => {
    const spy = vi.spyOn(component.filterChanged, 'emit');
    const testFilterText = 'test filter';

    component.filterText.set(testFilterText);
    component.onFilterChange();

    expect(spy).toHaveBeenCalledWith({
      name: 'test filter',
      statuses: [],
      tags: [],
    });
  });

  it('should emit filterChanged event when tag filter text changes', () => {
    const spy = vi.spyOn(component.filterChanged, 'emit');
    const testTagFilterText = 'UI, Tree';

    component.filterText.set(testTagFilterText);
    component.onFilterChange();

    expect(spy).toHaveBeenCalledWith({
      name: 'UI, Tree',
      statuses: [],
      tags: [],
    });
  });

  it('should update filterText signal when input value changes', async () => {
    const inputElement: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const testFilterText = 'another filter';

    inputElement.value = testFilterText;
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.filterText()).toBe(testFilterText);
  });
});
