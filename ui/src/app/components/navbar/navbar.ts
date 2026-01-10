import { Component, inject, viewChild } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NavbarDrawer } from './navbar-drawer/navbar-drawer';
import { Router } from '@angular/router';
import { LayoutService } from '../../services/layout.service';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, NavbarDrawer, NgOptimizedImage],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private router = inject(Router);
  private drawerRef = viewChild(NavbarDrawer);

  private layoutService = inject(LayoutService);

  layout = this.layoutService.layout;

  navigateHome() {
    void this.router.navigate(['/']);
  }

  onToggleSideNav() {
    this.drawerRef()?.toggle();
  }
}
