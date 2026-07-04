import { Component, computed, inject, viewChild } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NavbarDrawer } from './navbar-drawer/navbar-drawer';
import { Router } from '@angular/router';
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'app-navbar',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, NavbarDrawer],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private router = inject(Router);
  private drawerRef = viewChild(NavbarDrawer);

  private layoutService = inject(LayoutService);

  layout = this.layoutService.layout;

  drawerMode = computed(() => this.layout.value()?.navigationDrawer?.mode ?? 'over');
  drawerDefaultOpened = computed(
    () => this.layout.value()?.navigationDrawer?.defaultOpened ?? false,
  );
  drawerPosition = computed(() => this.layout.value()?.navigationDrawer?.position ?? 'start');

  navigateHome() {
    void this.router.navigate(['/']);
  }

  onToggleSideNav() {
    this.drawerRef()?.toggle();
  }
}
