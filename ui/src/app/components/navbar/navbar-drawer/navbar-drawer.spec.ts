import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { NavbarDrawer } from './navbar-drawer';
import { MatDrawer } from '@angular/material/sidenav';
import { LayoutService } from '../../../services/layout.service';
import { of } from 'rxjs';

describe('NavbarDrawer', () => {
  let component: NavbarDrawer;
  let fixture: ComponentFixture<NavbarDrawer>;
  let drawer: MatDrawer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarDrawer],
      providers: [
        {
          provide: LayoutService,
          useValue: {
            layout: {
              isLoading: () => false,
              error: () => null,
              hasValue: () => true,
              value: () => ({ pages: [], dataSources: [] }),
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarDrawer);
    component = fixture.componentInstance;
    drawer = (component as any).drawerRef() as MatDrawer;
    fixture.detectChanges();
  });

  describe('toggle', () => {
    it('should call toggle on the drawer', () => {
      const spy = vi.spyOn(drawer, 'toggle');
      component.toggle();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('close', () => {
    it('should call close on the drawer', () => {
      const spy = vi.spyOn(drawer, 'close');
      component.close();
      expect(spy).toHaveBeenCalled();
    });
  });
});
