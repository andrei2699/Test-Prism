import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestCountDisplayComponent } from './test-count-display';
import { TestExecutionType } from '../../../../types/TestReport';
import { By } from '@angular/platform-browser';
import { EXECUTION_TYPE_COLORS } from '../../../../shared/execution-type-colors';

function hexToRgb(hex: string): string | null {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (_, r, g, b) {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`
    : null;
}

describe('TestCountDisplayComponent', () => {
  let fixture: ComponentFixture<TestCountDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestCountDisplayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestCountDisplayComponent);
  });

  it('should display the total count and individual execution type counts with correct colors', () => {
    const testCounts: Record<TestExecutionType, number> = {
      SUCCESS: 5,
      FAILURE: 2,
      SKIPPED: 1,
      ERROR: 0,
    };

    fixture.componentRef.setInput('testCounts', testCounts);
    fixture.detectChanges();

    const totalCountElement = fixture.debugElement.query(By.css('.total-count'));
    expect(totalCountElement).toBeTruthy();
    expect(totalCountElement.nativeElement.textContent).toContain('(8)');

    const executionCountElements = fixture.debugElement.queryAll(By.css('.execution-count'));
    expect(executionCountElements.length).toBe(3);

    const successElement = executionCountElements.find(
      el => el.nativeElement.textContent.trim() === '5',
    );
    expect(successElement).toBeTruthy();
    expect(successElement?.nativeElement.style.color).toBe(hexToRgb(EXECUTION_TYPE_COLORS.SUCCESS));

    const failureElement = executionCountElements.find(
      el => el.nativeElement.textContent.trim() === '2',
    );
    expect(failureElement).toBeTruthy();
    expect(failureElement?.nativeElement.style.color).toBe(hexToRgb(EXECUTION_TYPE_COLORS.FAILURE));

    const skippedElement = executionCountElements.find(
      el => el.nativeElement.textContent.trim() === '1',
    );
    expect(skippedElement).toBeTruthy();
    expect(skippedElement?.nativeElement.style.color).toBe(hexToRgb(EXECUTION_TYPE_COLORS.SKIPPED));

    const errorCountElement = fixture.debugElement.query(
      By.css(`[style*="color: ${hexToRgb(EXECUTION_TYPE_COLORS.ERROR)}"]`),
    );
    expect(errorCountElement).toBeNull();
  });

  it('should not display any counts if totalCount is 0 (e.g., empty object or all zeros)', () => {
    const testCounts: Record<TestExecutionType, number> = {
      SUCCESS: 0,
      FAILURE: 0,
      SKIPPED: 0,
      ERROR: 0,
    };
    fixture.componentRef.setInput('testCounts', testCounts);
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.total-count')).length).toBe(0);
    expect(fixture.debugElement.queryAll(By.css('.execution-count')).length).toBe(0);
  });

  it('should display error count if present', () => {
    const testCounts: Record<TestExecutionType, number> = {
      SUCCESS: 0,
      FAILURE: 0,
      SKIPPED: 0,
      ERROR: 3,
    };

    fixture.componentRef.setInput('testCounts', testCounts);
    fixture.detectChanges();

    const totalCountElement = fixture.debugElement.query(By.css('.total-count'));
    expect(totalCountElement).toBeTruthy();
    expect(totalCountElement.nativeElement.textContent).toContain('(3)');

    const executionCountElements = fixture.debugElement.queryAll(By.css('.execution-count'));
    expect(executionCountElements.length).toBe(1);

    expect(executionCountElements[0].nativeElement.textContent).toContain('3');
    expect(executionCountElements[0].nativeElement.style.color).toBe(
      hexToRgb(EXECUTION_TYPE_COLORS.ERROR),
    );
  });

  it('should display tooltips with correct information for each execution type', () => {
    const testCounts: Record<TestExecutionType, number> = {
      SUCCESS: 5,
      FAILURE: 2,
      SKIPPED: 1,
      ERROR: 0,
    };

    fixture.componentRef.setInput('testCounts', testCounts);
    fixture.detectChanges();

    const executionCountElements = fixture.debugElement.queryAll(By.css('.execution-count'));

    const successElement = executionCountElements.find(
      el => el.nativeElement.textContent.trim() === '5',
    );
    expect(successElement).toBeTruthy();
    expect(successElement?.nativeElement.title).toBe('SUCCESS: 5');

    const failureElement = executionCountElements.find(
      el => el.nativeElement.textContent.trim() === '2',
    );
    expect(failureElement).toBeTruthy();
    expect(failureElement?.nativeElement.title).toBe('FAILURE: 2');

    const skippedElement = executionCountElements.find(
      el => el.nativeElement.textContent.trim() === '1',
    );
    expect(skippedElement).toBeTruthy();
    expect(skippedElement?.nativeElement.title).toBe('SKIPPED: 1');

    const totalElement = fixture.debugElement.query(By.css('.total-count'));
    expect(totalElement).toBeTruthy();
    expect(totalElement?.nativeElement.title).toBe('Total: 8');
  });
});
