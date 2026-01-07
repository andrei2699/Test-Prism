import { Component, input } from '@angular/core';
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
  page = input.required<Page>();
  tests = input.required<Test[]>();
}
