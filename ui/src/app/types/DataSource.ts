export type DataSourceId = string;

export interface DataSource {
  id: DataSourceId;
  url: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
}
