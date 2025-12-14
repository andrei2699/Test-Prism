import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestCountDisplayComponent } from './test-count-display';
import { TestExecutionType } from '../../types/TestReport';
import { By } from '@angular/platform-browser';
import { EXECUTION_TYPE_COLORS } from '../../shared/execution-type-colors';

describe('TestCountDisplayComponent', () => {
  let component: TestCountDisplayComponent;
  let fixture: ComponentFixture<TestCountDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestCountDisplayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestCountDisplayComponent);
    component = fixture.componentInstance;
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

    expect(executionCountElements[0].nativeElement.textContent).toContain('5');
    expect(executionCountElements[0].nativeElement.style.color).toBe(EXECUTION_TYPE_COLORS.SUCCESS);

    expect(executionCountElements[1].nativeElement.textContent).toContain('2');
    expect(executionCountElements[1].nativeElement.style.color).toBe(EXECUTION_TYPE_COLORS.FAILURE);

    expect(executionCountElements[2].nativeElement.textContent).toContain('1');
    expect(executionCountElements[2].nativeElement.style.color).toBe(EXECUTION_TYPE_COLORS.SKIPPED);

    const errorCountElement = fixture.debugElement.query(
      By.css(`[style*="color: ${EXECUTION_TYPE_COLORS.ERROR}"]`),
    );
    expect(errorCountElement).toBeNull();
  });

  it('should display only the total count if all individual counts are 0', () => {
    const testCounts: Record<TestExecutionType, number> = {
      SUCCESS: 0,
      FAILURE: 0,
      SKIPPED: 0,
      ERROR: 0,
    };

    fixture.componentRef.setInput('testCounts', testCounts);
    fixture.detectChanges();

    const totalCountElement = fixture.debugElement.query(By.css('.total-count'));
    expect(totalCountElement).toBeTruthy();
    expect(totalCountElement.nativeElement.textContent).toContain('(0)');

    const executionCountElements = fixture.debugElement.queryAll(By.css('.execution-count'));
    expect(executionCountElements.length).toBe(0);
  });

  it('should not display anything if testCounts is an empty object', () => {
    const testCounts: Record<TestExecutionType, number> = {} as Record<TestExecutionType, number>;

    fixture.componentRef.setInput('testCounts', testCounts);
    fixture.detectChanges();

    const testCountDisplayElement = fixture.debugElement.query(By.css('.test-count-display'));
    expect(testCountDisplayElement).toBeNull();
  });
});
