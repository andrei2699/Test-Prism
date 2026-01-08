import { DataSource } from './DataSource';
import { Widget } from './Widget';

export interface Layout {
  pages: Page[];
  dataSources: DataSource[];
}

export interface Page {
  title: string;
  path: string;
  navIcon?: string;
  widgets: Widget[];
}
