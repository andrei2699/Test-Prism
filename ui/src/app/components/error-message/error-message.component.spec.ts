import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorMessageComponent } from './error-message.component';

describe('ErrorMessageComponent', () => {
  let fixture: ComponentFixture<ErrorMessageComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ErrorMessageComponent],
    });

    fixture = TestBed.createComponent(ErrorMessageComponent);
    fixture.componentRef.setInput('title', 'Error');
    fixture.componentRef.setInput('message', 'Test error message');
    fixture.componentRef.setInput('hint', 'This is a hint');
    fixture.detectChanges();
  });

  it('should display title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('mat-card-title');

    expect(title?.textContent).toContain('Error');
  });

  it('should display message', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const content = compiled.querySelector('mat-card-content');

    expect(content?.textContent).toContain('Test error message');
  });

  it('should display hint', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const hint = compiled.querySelector('.hint');

    expect(hint?.textContent).toContain('This is a hint');
  });

  it('should display error icon', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('mat-icon')).toBeTruthy();
  });

  it('should use mat-card for styling', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('mat-card')).toBeTruthy();
  });
});
