import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SummaryWidgetComponent, SummaryWidgetParameters } from './summary-widget';
import { MatCardModule } from '@angular/material/card';
import { Test } from '../../../types/TestReport';
import { DatePipe } from '@angular/common';
import { By } from '@angular/platform-browser';
import { MatChipsModule } from '@angular/material/chips';
import { TestColors } from '../../../types/Layout';

describe('SummaryWidgetComponent', () => {
  let fixture: ComponentFixture<SummaryWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryWidgetComponent, MatCardModule, MatChipsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryWidgetComponent);
    fixture.componentRef.setInput('colors', {
      SUCCESS: 'green',
      FAILURE: 'red',
      SKIPPED: 'yellow',
      ERROR: 'orange',
    } satisfies TestColors);
  });

  it('should display the date in a human-readable format', () => {
    const testDate = '2023-10-27T10:00:00Z';
    fixture.componentRef.setInput('tests', []);
    fixture.componentRef.setInput('date', testDate);

    fixture.detectChanges();

    const contentElement = fixture.nativeElement.querySelector('mat-card-subtitle');
    const expectedDate = new DatePipe('en-US').transform(testDate, 'medium');
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
      {
        name: 'Test 1',
        path: '/test1',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
      },
      {
        name: 'Test 2',
        path: '/test2',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'FAILURE', durationMs: 100 }],
      },
      {
        name: 'Test 3',
        path: '/test3',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SKIPPED', durationMs: 100 }],
      },
      {
        name: 'Test 4',
        path: '/test4',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
      },
      {
        name: 'Test 5',
        path: '/test5',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'ERROR', durationMs: 100 }],
      },
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
