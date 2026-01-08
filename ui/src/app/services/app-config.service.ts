import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

export interface AppConfig {
  layoutUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  private http = inject(HttpClient);
  config: AppConfig | null = null;

  async loadConfig(): Promise<void> {
    try {
      this.config = await lastValueFrom(this.http.get<AppConfig>('/app-config.json'));
    } catch (e) {
      console.error('Could not load app configuration', e);
    }
  }
}
