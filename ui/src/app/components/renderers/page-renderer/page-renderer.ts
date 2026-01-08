import { Component, computed, input } from '@angular/core';
import { Page, TestColors } from '../../../types/Layout';
import { TestReport } from '../../../types/TestReport';
import { DataSourceId } from '../../../types/DataSource';
import { ContainerWidget } from '../../widgets/container-widget/container-widget';

@Component({
  selector: 'app-page-renderer',
  imports: [ContainerWidget],
  templateUrl: './page-renderer.html',
  styleUrl: './page-renderer.css',
})
export class PageRenderer {
  colors = input.required<TestColors>();
  pages = input.required<Page[]>();
  testReports = input.required<Record<DataSourceId, TestReport>>();
  path = input.required<string | null>();

  page = computed<Page>(() => {
    const pages = this.pages();
    const path = this.path();
    return pages.find(page => page.path.toLowerCase().trim().replace('/', '') === path) ?? pages[0];
  });
}
