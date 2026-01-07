import { Component, viewChild } from '@angular/core';
import { MatDrawer, MatDrawerContainer } from '@angular/material/sidenav';
import { NavbarDrawerContent } from '../navbar-drawer-content/navbar-drawer-content';

@Component({
  selector: 'app-navbar-drawer',
  imports: [MatDrawerContainer, MatDrawer, NavbarDrawerContent],
  templateUrl: './navbar-drawer.html',
  styleUrl: './navbar-drawer.css',
})
export class NavbarDrawer {
  private drawerRef = viewChild(MatDrawer);

  toggle() {
    this.drawerRef()?.toggle();
  }

  close() {
    this.drawerRef()?.close();
  }
}
