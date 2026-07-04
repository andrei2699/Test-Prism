import { Component, input, viewChild } from '@angular/core';
import { MatDrawer, MatDrawerContainer, MatDrawerMode } from '@angular/material/sidenav';
import { NavbarDrawerContent } from '../navbar-drawer-content/navbar-drawer-content';

@Component({
  selector: 'app-navbar-drawer',
  imports: [MatDrawerContainer, MatDrawer, NavbarDrawerContent],
  templateUrl: './navbar-drawer.html',
  styleUrl: './navbar-drawer.css',
})
export class NavbarDrawer {
  private drawerRef = viewChild(MatDrawer);

  mode = input<MatDrawerMode>('over');
  defaultOpened = input<boolean>(false);
  position = input<'start' | 'end'>('start');

  toggle() {
    this.drawerRef()?.toggle();
  }

  close() {
    this.drawerRef()?.close();
  }
}
