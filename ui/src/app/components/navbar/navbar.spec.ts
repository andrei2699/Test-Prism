import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { Navbar } from './navbar';
import { NavbarDrawer } from './navbar-drawer/navbar-drawer';
import { LayoutService } from '../../services/layout.service';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;
  let router: Router;
  let drawer: NavbarDrawer;
  let layoutService: LayoutService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [
        {
          provide: Router,
          useValue: {
            navigate: vi.fn(),
          },
        },
        {
          provide: LayoutService,
          useValue: {
            layout: {
              isLoading: signal(false),
              error: signal(null),
              hasValue: signal(true),
              value: signal({ pages: [], dataSources: [] }),
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    layoutService = TestBed.inject(LayoutService);

    const drawerMock = {
      toggle: vi.fn(),
      close: vi.fn(),
    };
    (component as any).drawerRef = () => drawerMock;
    drawer = drawerMock as any;

    fixture.detectChanges();
  });

  describe('navigateHome', () => {
    it('should navigate to the home route', () => {
      component.navigateHome();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('onToggleSideNav', () => {
    it('should toggle the drawer', () => {
      component.onToggleSideNav();
      expect(drawer.toggle).toHaveBeenCalled();
    });
  });

  describe('Menu Button', () => {
    it('should display the menu button when there is more than one page', () => {
      (layoutService.layout.value as any).set({ pages: [{}, {}], dataSources: [] });
      fixture.detectChanges();
      const button = fixture.debugElement.query(By.css('button[matIconButton]'));
      expect(button).toBeTruthy();
    });

    it('should not display the menu button when there is one page', () => {
      (layoutService.layout.value as any).set({ pages: [{}], dataSources: [] });
      fixture.detectChanges();
      const button = fixture.debugElement.query(By.css('button[matIconButton]'));
      expect(button).toBeFalsy();
    });

    it('should not display the menu button when there are no pages', () => {
      (layoutService.layout.value as any).set({ pages: [], dataSources: [] });
      fixture.detectChanges();
      const button = fixture.debugElement.query(By.css('button[matIconButton]'));
      expect(button).toBeFalsy();
    });
  });
});
