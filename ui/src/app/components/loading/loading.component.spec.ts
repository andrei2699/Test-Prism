import { beforeEach, describe, expect, it } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingComponent } from './loading.component';

describe('LoadingComponent', () => {
  let fixture: ComponentFixture<LoadingComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [LoadingComponent],
    });

    fixture = TestBed.createComponent(LoadingComponent);
    fixture.componentRef.setInput('message', 'Loading...');
    fixture.detectChanges();
  });

  it('should display message', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const paragraph = compiled.querySelector('p');
    expect(paragraph?.textContent).toContain('Loading...');
  });

  it('should display progress bar', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('mat-progress-bar')).toBeTruthy();
  });

  it('should update message when input changes', () => {
    fixture.componentRef.setInput('message', 'Custom loading message');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const paragraph = compiled.querySelector('p');
    expect(paragraph?.textContent).toContain('Custom loading message');
  });
});
