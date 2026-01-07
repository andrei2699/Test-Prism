import { Component, inject, output } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Router } from '@angular/router';
import { LayoutService } from '../../../services/layout.service';
import { ErrorMessageComponent } from '../../error-message/error-message.component';
import { LoadingComponent } from '../../loading/loading.component';
import { Page } from '../../../types/Layout';

@Component({
  selector: 'app-navbar-drawer-content',
  imports: [
    MatListModule,
    MatIconModule,
    MatDividerModule,
    ErrorMessageComponent,
    LoadingComponent,
  ],
  templateUrl: './navbar-drawer-content.html',
  styleUrl: './navbar-drawer-content.css',
})
export class NavbarDrawerContent {
  private router = inject(Router);
  private layoutService = inject(LayoutService);

  layout = this.layoutService.layout;

  onNavigate = output();

  navigate(page: Page) {
    this.onNavigate.emit();
    void this.router.navigate([page.path]);
  }
}
