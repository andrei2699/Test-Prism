import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestDetailsDrawer } from './test-details-drawer';
import { Test } from '../../../../types/TestReport';
import { TestColors } from '../../../../types/Layout';

describe('TestDetailsDrawer', () => {
  let component: TestDetailsDrawer;
  let fixture: ComponentFixture<TestDetailsDrawer>;

  const mockTest: Test = {
    name: 'test1',
    path: ['path', 'to', 'test1'],
    executions: [
      { timestamp: '2023-01-03T00:00:00Z', status: 'FAILED', durationMs: 500 },
      { timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 1000 },
      { timestamp: '2023-01-02T00:00:00Z', status: 'SKIPPED', durationMs: 200 },
    ],
    tags: ['tag1', 'tag2'],
  };

  const mockColors: TestColors = {
    PASSED: 'green',
    FAILED: 'red',
    SKIPPED: 'yellow',
    ERROR: 'orange',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestDetailsDrawer],
    }).compileComponents();

    fixture = TestBed.createComponent(TestDetailsDrawer);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('test', mockTest);
    fixture.componentRef.setInput('colors', mockColors);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display test name', () => {
    const element = fixture.nativeElement;
    expect(element.textContent).toContain('test1');
  });

  it('should display test path', () => {
    const element = fixture.nativeElement;
    expect(element.textContent).toContain('path › to › test1');
  });

  it('should display last execution status with correct color', () => {
    const element = fixture.nativeElement;
    const statusElement = element.querySelector('.value[style*="color: red"]');
    expect(statusElement).toBeTruthy();
    expect(statusElement.textContent).toContain('FAILED');
  });

  it('should display tags', () => {
    const element = fixture.nativeElement;
    expect(element.textContent).toContain('tag1');
    expect(element.textContent).toContain('tag2');
  });

  it('should emit close event when close button is clicked', () => {
    const closeSpy = vi.fn();
    component.close.subscribe(closeSpy);

    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(closeSpy).toHaveBeenCalled();
  });

  describe('Execution History', () => {
    it('should render the execution history section', () => {
      const section = fixture.nativeElement.querySelector('.executions-section');
      expect(section).toBeTruthy();
    });

    it('should render a row for every execution', () => {
      const rows = fixture.nativeElement.querySelectorAll('.executions-table tbody tr');
      expect(rows.length).toBe(3);
    });

    it('should display executions sorted newest first', () => {
      const rows: NodeListOf<HTMLTableRowElement> = fixture.nativeElement.querySelectorAll(
        '.executions-table tbody tr',
      );
      const statuses = Array.from(rows).map(row => row.cells[1].textContent?.trim());
      expect(statuses).toEqual(['FAILED', 'SKIPPED', 'PASSED']);
    });

    it('should color each status cell using the provided colors', () => {
      const rows: NodeListOf<HTMLTableRowElement> = fixture.nativeElement.querySelectorAll(
        '.executions-table tbody tr',
      );
      expect(rows[0].cells[1].getAttribute('style')).toContain('red');
      expect(rows[1].cells[1].getAttribute('style')).toContain('yellow');
      expect(rows[2].cells[1].getAttribute('style')).toContain('green');
    });

    it('should display the duration for each execution', () => {
      const rows: NodeListOf<HTMLTableRowElement> = fixture.nativeElement.querySelectorAll(
        '.executions-table tbody tr',
      );
      expect(rows[0].cells[2].textContent?.trim()).not.toBe('');
      expect(rows[1].cells[2].textContent?.trim()).not.toBe('');
      expect(rows[2].cells[2].textContent?.trim()).not.toBe('');
    });

    it('should expose sortedExecutions ordered newest first via the computed signal', () => {
      const sorted = component.sortedExecutions();
      expect(sorted[0].timestamp).toBe('2023-01-03T00:00:00Z');
      expect(sorted[1].timestamp).toBe('2023-01-02T00:00:00Z');
      expect(sorted[2].timestamp).toBe('2023-01-01T00:00:00Z');
    });

    it('should not mutate the original executions array', () => {
      const originalOrder = mockTest.executions.map(e => e.timestamp);
      component.sortedExecutions();
      expect(mockTest.executions.map(e => e.timestamp)).toEqual(originalOrder);
    });
  });
});
