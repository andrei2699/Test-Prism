import { inject, Injectable } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Layout } from '../types/Layout';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  private appConfigService = inject(AppConfigService);

  layout = httpResource<Layout>(() => {
    const path = this.appConfigService.config?.layoutUrl;
    if (!path) {
      throw new Error('Layout URL is not configured in app-config.json');
    }
    return path;
  });
}
