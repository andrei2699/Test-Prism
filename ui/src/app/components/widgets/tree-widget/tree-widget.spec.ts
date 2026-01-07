import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeWidget } from './tree-widget';

describe('TreeWidget', () => {
  let component: TreeWidget;
  let fixture: ComponentFixture<TreeWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreeWidget],
    }).compileComponents();

    fixture = TestBed.createComponent(TreeWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
