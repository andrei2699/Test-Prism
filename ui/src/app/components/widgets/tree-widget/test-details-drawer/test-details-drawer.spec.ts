import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestDetailsDrawer } from './test-details-drawer';
import { Test } from '../../../../types/TestReport';
import { TestColors } from '../../../../types/Layout';

describe('TestDetailsDrawer', () => {
  let component: TestDetailsDrawer;
  let fixture: ComponentFixture<TestDetailsDrawer>;

  const mockTest: Test = {
    name: 'test1',
    path: '/path/to/test1',
    executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 1000 }],
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
    expect(element.textContent).toContain('/path/to/test1');
  });

  it('should display test status with correct color', () => {
    const element = fixture.nativeElement;
    const statusElement = element.querySelector('.value[style*="color: green"]');
    expect(statusElement).toBeTruthy();
    expect(statusElement.textContent).toContain('PASSED');
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
});
