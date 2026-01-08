import { Component, computed, input } from '@angular/core';
import { Page } from '../../../types/Layout';
import { WidgetRenderer } from '../widget-renderer/widget-renderer';
import { Test } from '../../../types/TestReport';

@Component({
  selector: 'app-page-renderer',
  imports: [WidgetRenderer],
  templateUrl: './page-renderer.html',
  styleUrl: './page-renderer.css',
})
export class PageRenderer {
  pages = input.required<Page[]>();
  tests = input.required<Test[]>();
  path = input.required<string | null>();

  page = computed<Page>(() => {
    const pages = this.pages();
    const path = this.path();
    return pages.find(page => page.path.toLowerCase().trim().replace('/', '') === path) ?? pages[0];
  });
}
