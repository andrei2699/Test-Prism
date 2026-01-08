import { DataSource } from './DataSource';
import { Widget } from './Widget';
import { TestExecutionType } from './TestReport';

export interface Layout {
  pages: Page[];
  dataSources: DataSource[];
  colors?: TestColors;
}

export interface Page {
  title: string;
  path: string;
  navIcon?: string;
  widgets: Widget[];
}

export type TestColors = Record<TestExecutionType, string>;
