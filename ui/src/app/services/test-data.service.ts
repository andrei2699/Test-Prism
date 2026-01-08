import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TestReport } from '../types/TestReport';
import { forkJoin, Observable, of } from 'rxjs';
import { DataSource, DataSourceId } from '../types/Layout';

@Injectable({
  providedIn: 'root',
})
export class TestDataService {
  private http = inject(HttpClient);

  getTestReportsFromAllDataSources(
    dataSources: DataSource[],
  ): Observable<Record<DataSourceId, TestReport>> {
    if (dataSources.length === 0) {
      return of({});
    }

    const observablesMap = dataSources
      .map(datasource => {
        return {
          [datasource.id]: this.getTestReportFromDataSource(datasource),
        };
      })
      .reduce((acc, curr) => ({ ...acc, ...curr }), {});

    return forkJoin(observablesMap);
  }

  private getTestReportFromDataSource(dataSource: DataSource) {
    return this.http.get<TestReport>(dataSource.url, {
      headers: dataSource.headers,
      params: dataSource.queryParams,
    });
  }
}
