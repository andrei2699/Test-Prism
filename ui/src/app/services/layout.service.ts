import { inject, Injectable, resource } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { Layout } from '../types/Layout';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  private http = inject(HttpClient);

  layout = resource({
    loader: async () => {
      const path = this.getLayoutPath();
      if (!path) {
        throw new Error('LAYOUT_FILE environment variable is not set');
      }
      return lastValueFrom(this.http.get<Layout>(path));
    },
  });

  private getLayoutPath(): string | null {
    const windowEnv = (window as any)['ENV'];
    return windowEnv?.LAYOUT_FILE || null;
  }
}
