import { Component, computed, inject, signal } from '@angular/core';
import { LoadingComponent } from '../../components/loading/loading.component';
import { ErrorMessageComponent } from '../../components/error-message/error-message.component';
import { TestDataService } from '../../services/test-data.service';
import { Layout, Page } from '../../types/Layout';
import { PageRenderer } from '../../components/renderers/page-renderer/page-renderer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [LoadingComponent, ErrorMessageComponent, PageRenderer],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private testDataService = inject(TestDataService);

  testData = this.testDataService.testData;

  layout = signal<Layout>({
    dataSources: [
      {
        id: 'main',
        url: 'http://localhost:8080/test-results/results.json',
      },
    ],
    pages: [
      {
        title: 'Main Report',
        path: '/',
        widgets: [
          {
            id: 'overview-distribution-pie',
            type: 'distribution-pie',
            data: {
              dataSourceId: 'main',
            },
          },
          {
            id: 'tests-tree',
            type: 'tree',
            data: {
              dataSourceId: 'main',
            },
          },
        ],
      },
    ],
  });

  currentPage = computed<Page>(() => this.layout().pages[0]);
}
