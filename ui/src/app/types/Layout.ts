import { DataSource } from './DataSource';
import { Widget } from './Widget';
import { TestExecutionStatus } from './TestReport';

export interface NavigationDrawerConfig {
  mode?: 'over' | 'push' | 'side';
  defaultOpened?: boolean;
  position?: 'start' | 'end';
}

export interface Layout {
  pages: Page[];
  dataSources: DataSource[];
  colors?: TestColors;
  navigationDrawer?: NavigationDrawerConfig;
}

export interface Page {
  title: string;
  path: string;
  navIcon?: string;
  widgets: Widget[];
}

export type TestColors = Record<TestExecutionStatus, string>;
