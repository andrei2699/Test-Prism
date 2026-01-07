export interface Layout {
  pages: Page[];
  dataSources: DataSource[];
}

export interface Page {
  title: string;
  path: string;
  widgets: Widget[];
}

export type WidgetType = 'tree' | 'distribution-pie' | 'analysis-summary';

export interface Widget {
  id: string;
  type: WidgetType;
  // TODO: type properties
  properties?: Record<string, object>;
  data: WidgetData;
  style?: CSSStyleDeclaration;
}

export interface WidgetData {
  dataSourceId: DataSourceId;
  filter?: DataFilter;
}

export interface DataFilter {
  // TODO: add missing properties
}

export type DataSourceId = string;

export interface DataSource {
  id: DataSourceId;
  url: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
}
