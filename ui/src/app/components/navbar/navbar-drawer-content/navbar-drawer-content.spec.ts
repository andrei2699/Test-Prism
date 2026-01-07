import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { LayoutService } from '../../../services/layout.service';
import { Layout, Page } from '../../../types/Layout';
import { NavbarDrawerContent } from './navbar-drawer-content';
import { signal } from '@angular/core';

describe('NavbarDrawerContent', () => {
  let fixture: ComponentFixture<NavbarDrawerContent>;
  let router: Router;
  let layoutService: LayoutService;

  const mockPages: Page[] = [
    { title: 'Page 1', path: '/page1', navIcon: 'home', widgets: [] },
    { title: 'Page 2', path: '/page2', navIcon: 'info', widgets: [] },
  ];
  const mockLayout: Layout = { pages: mockPages, dataSources: [] };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarDrawerContent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: LayoutService,
          useValue: {
            layout: {
              isLoading: signal(false),
              error: signal(null),
              hasValue: signal(true),
              value: signal(mockLayout),
            },
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarDrawerContent);
    router = TestBed.inject(Router);
    layoutService = TestBed.inject(LayoutService);
    fixture.detectChanges();
  });

  it('should display a loading indicator when loading', () => {
    (layoutService.layout.isLoading as any).set(true);
    fixture.detectChanges();

    const loadingComponent = fixture.debugElement.query(By.css('app-loading'));
    expect(loadingComponent).toBeTruthy();
  });

  it('should display an error message when an error occurs', () => {
    const errorMessage = 'Test Error';
    (layoutService.layout.error as any).set({ message: errorMessage });
    fixture.detectChanges();

    const errorComponent = fixture.debugElement.query(By.css('app-error-message'));
    expect(errorComponent).toBeTruthy();
    expect(errorComponent.nativeElement.textContent).toContain(errorMessage);
  });

  it('should display the list of pages when data is loaded', () => {
    const pageRows = fixture.debugElement.queryAll(By.css('mat-list-item'));
    expect(pageRows.length).toBe(mockPages.length);

    pageRows.forEach((row, index) => {
      expect(row.nativeElement.textContent).toContain(mockPages[index].title);
    });
  });

  it('should navigate when a page is clicked', () => {
    let navigated = false;
    const subscription = fixture.componentInstance.onNavigate.subscribe(() => {
      navigated = true;
    });

    const firstPageLink = fixture.debugElement.query(By.css('mat-list-item'));
    firstPageLink.nativeElement.click();
    fixture.detectChanges();

    expect(navigated).toBe(true);
    expect(router.navigate).toHaveBeenCalledWith([mockPages[0].path]);

    subscription.unsubscribe();
  });
});
