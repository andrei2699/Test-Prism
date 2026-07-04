import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { NavbarDrawer } from './navbar-drawer';
import { MatDrawer } from '@angular/material/sidenav';
import { LayoutService } from '../../../services/layout.service';

describe('NavbarDrawer', () => {
  let component: NavbarDrawer;
  let fixture: ComponentFixture<NavbarDrawer>;
  let drawer: MatDrawer;

  function createComponent(
    inputs: Partial<{
      mode: 'over' | 'push' | 'side';
      defaultOpened: boolean;
      position: 'start' | 'end';
    }> = {},
  ) {
    fixture = TestBed.createComponent(NavbarDrawer);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('mode', inputs.mode ?? 'over');
    fixture.componentRef.setInput('defaultOpened', inputs.defaultOpened ?? false);
    fixture.componentRef.setInput('position', inputs.position ?? 'start');
    fixture.detectChanges();
    drawer = (component as any).drawerRef() as MatDrawer;
  }

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

    createComponent();
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

  describe('mode input', () => {
    it('should default to over', () => {
      expect(component.mode()).toBe('over');
    });

    it('should accept side mode', () => {
      fixture.componentRef.setInput('mode', 'side');
      fixture.detectChanges();
      expect(component.mode()).toBe('side');
    });

    it('should accept push mode', () => {
      fixture.componentRef.setInput('mode', 'push');
      fixture.detectChanges();
      expect(component.mode()).toBe('push');
    });
  });

  describe('defaultOpened input', () => {
    it('should default to false', () => {
      expect(component.defaultOpened()).toBe(false);
    });

    it('should reflect true when set', () => {
      fixture.componentRef.setInput('defaultOpened', true);
      fixture.detectChanges();
      expect(component.defaultOpened()).toBe(true);
    });
  });

  describe('position input', () => {
    it('should default to start', () => {
      expect(component.position()).toBe('start');
    });

    it('should accept end position', () => {
      fixture.componentRef.setInput('position', 'end');
      fixture.detectChanges();
      expect(component.position()).toBe('end');
    });
  });
});
