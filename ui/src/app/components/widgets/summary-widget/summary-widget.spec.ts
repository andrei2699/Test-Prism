import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SummaryWidgetComponent, SummaryWidgetParameters } from './summary-widget';
import { MatCardModule } from '@angular/material/card';
import { Test } from '../../../types/TestReport';
import { DatePipe } from '@angular/common';
import { By } from '@angular/platform-browser';
import { EXECUTION_TYPE_COLORS } from '../../../shared/execution-type-colors';
import { MatChipsModule } from '@angular/material/chips';

describe('SummaryWidgetComponent', () => {
  let component: SummaryWidgetComponent;
  let fixture: ComponentFixture<SummaryWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryWidgetComponent, MatCardModule, MatChipsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryWidgetComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('tests', []);
    fixture.componentRef.setInput('date', new Date().toISOString());

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should display the date in a human-readable format', () => {
    const testDate = '2023-10-27T10:00:00Z';
    fixture.componentRef.setInput('tests', []);
    fixture.componentRef.setInput('date', testDate);

    fixture.detectChanges();

    const contentElement = fixture.nativeElement.querySelector('mat-card-content');
    const expectedDate = new DatePipe('en-US').transform(testDate, 'fullDate');
    expect(contentElement.textContent).toContain(expectedDate);
  });

  it('should display the default title when no parameters are provided', () => {
    fixture.componentRef.setInput('tests', []);
    fixture.componentRef.setInput('date', new Date().toISOString());

    fixture.detectChanges();

    const titleElement = fixture.nativeElement.querySelector('mat-card-title');
    expect(titleElement.textContent).toContain('Analysis Summary');
  });

  it('should display the custom title from parameters', () => {
    const parameters: SummaryWidgetParameters = { title: 'Custom Title' };
    fixture.componentRef.setInput('tests', []);
    fixture.componentRef.setInput('date', new Date().toISOString());
    fixture.componentRef.setInput('parameters', parameters);

    fixture.detectChanges();

    const titleElement = fixture.nativeElement.querySelector('mat-card-title');
    expect(titleElement.textContent).toContain('Custom Title');
  });

  it('should display summary counts and colors including error status', () => {
    const tests: Test[] = [
      { name: 'Test 1', path: '/test1', lastExecutionType: 'SUCCESS' },
      { name: 'Test 2', path: '/test2', lastExecutionType: 'FAILURE' },
      { name: 'Test 3', path: '/test3', lastExecutionType: 'SKIPPED' },
      { name: 'Test 4', path: '/test4', lastExecutionType: 'SUCCESS' },
      { name: 'Test 5', path: '/test5', lastExecutionType: 'ERROR' },
    ];
    fixture.componentRef.setInput('tests', tests);
    fixture.componentRef.setInput('date', new Date().toISOString());

    fixture.detectChanges();

    const summaryElements = fixture.debugElement.queryAll(By.css('mat-chip-option'));
    const summaryTexts = summaryElements.map(el => el.nativeElement.textContent.trim());
    expect(summaryTexts).toContain('Total: 5');
    expect(summaryTexts).toContain('Passed: 2');
    expect(summaryTexts).toContain('Failed: 1');
    expect(summaryTexts).toContain('Skipped: 1');
    expect(summaryTexts).toContain('Error: 1');
  });
});
