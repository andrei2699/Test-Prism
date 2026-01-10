import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TagFilterInputComponent } from './tag-filter-input.component';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatChipGridHarness } from '@angular/material/chips/testing';
import { MatAutocompleteHarness } from '@angular/material/autocomplete/testing';
import { vi } from 'vitest';

describe('TagFilterInputComponent', () => {
  let component: TagFilterInputComponent;
  let fixture: ComponentFixture<TagFilterInputComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagFilterInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TagFilterInputComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('allTags', ['tag1', 'tag2', 'tag3']);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add a tag by selecting an option', async () => {
    const spy = vi.spyOn(component.tagsChanged, 'emit');
    const autocomplete = await loader.getHarness(MatAutocompleteHarness);
    await autocomplete.enterText('tag1');
    await autocomplete.selectOption({ text: 'tag1' });
    fixture.detectChanges();

    const chipGrid = await loader.getHarness(MatChipGridHarness);
    const chips = await chipGrid.getRows();
    expect(chips.length).toBe(1);
    expect(await chips[0].getText()).toBe('tag1');
    expect(spy).toHaveBeenCalledWith(['tag1']);
  });

  it('should remove a tag by clicking the remove button', async () => {
    const spy = vi.spyOn(component.tagsChanged, 'emit');
    const autocomplete = await loader.getHarness(MatAutocompleteHarness);
    await autocomplete.enterText('tag1');
    await autocomplete.selectOption({ text: 'tag1' });
    fixture.detectChanges();

    let chipGrid = await loader.getHarness(MatChipGridHarness);
    let chips = await chipGrid.getRows();
    expect(chips.length).toBe(1);

    await chips[0].remove();
    fixture.detectChanges();

    chipGrid = await loader.getHarness(MatChipGridHarness);
    chips = await chipGrid.getRows();
    expect(chips.length).toBe(0);
    expect(spy).toHaveBeenCalledWith([]);
  });

  it('should filter suggestions', async () => {
    const autocomplete = await loader.getHarness(MatAutocompleteHarness);
    await autocomplete.enterText('tag');
    const options = await autocomplete.getOptions();
    expect(options.length).toBe(3);

    await autocomplete.enterText('1');
    const filteredOptions = await autocomplete.getOptions();
    expect(filteredOptions.length).toBe(1);
    expect(await filteredOptions[0].getText()).toBe('tag1');
  });

  it('should show "No tags found" when no suggestions match', async () => {
    const autocomplete = await loader.getHarness(MatAutocompleteHarness);
    await autocomplete.enterText('nonexistent');
    const options = await autocomplete.getOptions();
    expect(options.length).toBe(1);
    expect(await options[0].getText()).toBe('No tags found');
    expect(await options[0].isDisabled()).toBe(true);
  });
});
