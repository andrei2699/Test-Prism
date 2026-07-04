import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TestReport } from '../types/TestReport';
import { forkJoin, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataSource, DataSourceId } from '../types/DataSource';
import { getPathParts } from '../utils/pathUtils';

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
    return this.http
      .get<any>(dataSource.url, {
        headers: dataSource.headers,
        params: dataSource.queryParams,
      })
      .pipe(
        map(report => {
          if (report && Array.isArray(report.tests)) {
            report.tests = report.tests.map((test: any) => {
              test.path = getPathParts(test.path);
              return test;
            });
          }
          return report as TestReport;
        }),
      );
  }
}
