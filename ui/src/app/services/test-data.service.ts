import { Injectable, inject, resource } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TestReport } from '../types/TestReport';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TestDataService {
  private http = inject(HttpClient);

  testData = resource({
    loader: async () => {
      const path = this.getTestResultsPath();
      if (!path) {
        throw new Error('TEST_RESULTS_FILE environment variable is not set');
      }
      return lastValueFrom(this.http.get<TestReport>(path));
    },
  });

  private getTestResultsPath(): string | null {
    const windowEnv = (window as any)['ENV'];
    return windowEnv?.TEST_RESULTS_FILE || null;
  }
}
