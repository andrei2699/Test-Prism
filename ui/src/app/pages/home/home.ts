import { Component, computed, inject, signal } from '@angular/core';
import { LoadingComponent } from '../../components/loading/loading.component';
import { ErrorMessageComponent } from '../../components/error-message/error-message.component';
import { TestDataService } from '../../services/test-data.service';
import { PageRenderer } from '../../components/renderers/page-renderer/page-renderer';
import { LayoutService } from '../../services/layout.service';
import { ActivatedRoute } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { TestColors } from '../../types/Layout';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [LoadingComponent, ErrorMessageComponent, PageRenderer],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private testDataService = inject(TestDataService);
  private layoutService = inject(LayoutService);
  private activatedRoute = inject(ActivatedRoute);

  layout = this.layoutService.layout;

  path = signal<string | null>(null);

  dataSourcesTestReports = rxResource({
    params: () => {
      if (!this.layout.hasValue()) {
        return {
          dataSources: [],
        };
      }
      return { dataSources: this.layout.value()?.dataSources };
    },
    stream: ({ params }) =>
      this.testDataService.getTestReportsFromAllDataSources(params.dataSources),
  });

  colors = computed<TestColors>(() => {
    return this.layout.value()?.colors ?? DEFAULT_TEST_COLORS;
  });

  constructor() {
    this.activatedRoute.params.subscribe(params => {
      this.path.set(params['path']);
    });
  }
}

const DEFAULT_TEST_COLORS: TestColors = {
  SUCCESS: '#4caf50',
  FAILURE: '#f44336',
  ERROR: '#ff9800',
  SKIPPED: '#9e9e9e',
};
