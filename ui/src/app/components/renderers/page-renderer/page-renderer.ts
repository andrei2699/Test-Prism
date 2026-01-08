import { Component, computed, input } from '@angular/core';
import { DataSourceId, Page } from '../../../types/Layout';
import { WidgetRenderer } from '../widget-renderer/widget-renderer';
import { TestReport } from '../../../types/TestReport';

@Component({
  selector: 'app-page-renderer',
  imports: [WidgetRenderer],
  templateUrl: './page-renderer.html',
  styleUrl: './page-renderer.css',
})
export class PageRenderer {
  pages = input.required<Page[]>();
  testReports = input.required<Record<DataSourceId, TestReport>>();
  path = input.required<string | null>();

  page = computed<Page>(() => {
    const pages = this.pages();
    const path = this.path();
    return pages.find(page => page.path.toLowerCase().trim().replace('/', '') === path) ?? pages[0];
  });
}
