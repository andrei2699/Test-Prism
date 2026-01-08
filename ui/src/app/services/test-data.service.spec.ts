import { afterEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestDataService } from './test-data.service';
import { TestReport } from '../types/TestReport';
import { firstValueFrom } from 'rxjs';
import { DataSource } from '../types/DataSource';

describe('TestDataService', () => {
  const mockTestReport: TestReport = {
    version: 1,
    date: '2023-01-01T00:00:00Z',
    tests: [
      {
        name: 'test 1',
        path: '/path/1',
        lastExecutionType: 'SUCCESS',
        durationMs: 100,
      },
    ],
  };

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  describe('getTestReportsFromAllDataSources', () => {
    it('should return an empty object for no data sources', async () => {
      TestBed.configureTestingModule({
        providers: [provideHttpClientTesting(), TestDataService],
      });
      const service = TestBed.inject(TestDataService);

      const result = await firstValueFrom(service.getTestReportsFromAllDataSources([]));

      expect(result).toEqual({});
    });

    it('should fetch a report from a single data source', async () => {
      TestBed.configureTestingModule({
        providers: [provideHttpClientTesting(), TestDataService],
      });
      const service = TestBed.inject(TestDataService);
      const httpMock = TestBed.inject(HttpTestingController);
      const dataSources: DataSource[] = [{ id: 'source1', url: '/api/source1' }];

      const promise = firstValueFrom(service.getTestReportsFromAllDataSources(dataSources));

      const req = httpMock.expectOne('/api/source1');
      expect(req.request.method).toBe('GET');
      req.flush(mockTestReport);

      const result = await promise;
      expect(result).toEqual({ source1: mockTestReport });
    });

    it('should fetch reports from multiple data sources', async () => {
      TestBed.configureTestingModule({
        providers: [provideHttpClientTesting(), TestDataService],
      });
      const service = TestBed.inject(TestDataService);
      const httpMock = TestBed.inject(HttpTestingController);

      const dataSources: DataSource[] = [
        { id: 'source1', url: '/api/source1' },
        { id: 'source2', url: '/api/source2' },
      ];
      const mockReport1: TestReport = { ...mockTestReport, version: 2 };
      const mockReport2: TestReport = { ...mockTestReport, version: 3 };

      const promise = firstValueFrom(service.getTestReportsFromAllDataSources(dataSources));

      const req1 = httpMock.expectOne('/api/source1');
      req1.flush(mockReport1);

      const req2 = httpMock.expectOne('/api/source2');
      req2.flush(mockReport2);

      const result = await promise;
      expect(result).toEqual({
        source1: mockReport1,
        source2: mockReport2,
      });
    });

    it('should handle an error from one data source', async () => {
      TestBed.configureTestingModule({
        providers: [provideHttpClientTesting(), TestDataService],
      });
      const service = TestBed.inject(TestDataService);
      const httpMock = TestBed.inject(HttpTestingController);

      const dataSources: DataSource[] = [
        { id: 'source1', url: '/api/source1' },
        { id: 'source2', url: '/api/source2' },
      ];
      const mockReport1: TestReport = { ...mockTestReport, version: 2 };

      const promise = firstValueFrom(service.getTestReportsFromAllDataSources(dataSources));

      const req1 = httpMock.expectOne('/api/source1');
      req1.flush(mockReport1);

      const req2 = httpMock.expectOne('/api/source2');
      req2.flush('Error', { status: 500, statusText: 'Server Error' });

      expect(promise).rejects.toThrow('Http failure response for /api/source2: 500 Server Error');
    });

    it('given error for one of the data sources, then expect error and one request to be cancelled', async () => {
      TestBed.configureTestingModule({
        providers: [provideHttpClientTesting(), TestDataService],
      });
      const service = TestBed.inject(TestDataService);
      const httpMock = TestBed.inject(HttpTestingController);

      const dataSources: DataSource[] = [
        { id: 'source1', url: '/api/source1' },
        { id: 'source2', url: '/api/source2' },
      ];

      const promise = firstValueFrom(service.getTestReportsFromAllDataSources(dataSources));

      const req1 = httpMock.expectOne('/api/source1');
      const req2 = httpMock.expectOne('/api/source2');

      req1.flush('Error', { status: 500, statusText: 'Server Error' });
      expect(req2.cancelled).toBeTruthy();

      expect(promise).rejects.toThrow(
        /Http failure response for \/api\/source\d+: 500 Server Error/,
      );
    });

    it('should include query params in the request', async () => {
      TestBed.configureTestingModule({
        providers: [provideHttpClientTesting(), TestDataService],
      });
      const service = TestBed.inject(TestDataService);
      const httpMock = TestBed.inject(HttpTestingController);

      const dataSources: DataSource[] = [
        {
          id: 'source1',
          url: '/api/source1',
          queryParams: { param1: 'value1', param2: 'value2' },
        },
      ];

      const promise = firstValueFrom(service.getTestReportsFromAllDataSources(dataSources));

      const req = httpMock.expectOne('/api/source1?param1=value1&param2=value2');
      expect(req.request.method).toBe('GET');
      req.flush(mockTestReport);

      await promise;
    });

    it('should include headers in the request', async () => {
      TestBed.configureTestingModule({
        providers: [provideHttpClientTesting(), TestDataService],
      });
      const service = TestBed.inject(TestDataService);
      const httpMock = TestBed.inject(HttpTestingController);

      const dataSources: DataSource[] = [
        {
          id: 'source1',
          url: '/api/source1',
          headers: { Authorization: 'Bearer token' },
        },
      ];

      const promise = firstValueFrom(service.getTestReportsFromAllDataSources(dataSources));

      const req = httpMock.expectOne('/api/source1');
      expect(req.request.headers.get('Authorization')).toBe('Bearer token');
      req.flush(mockTestReport);

      await promise;
    });

    it('should handle query params embedded in the url', async () => {
      TestBed.configureTestingModule({
        providers: [provideHttpClientTesting(), TestDataService],
      });
      const service = TestBed.inject(TestDataService);
      const httpMock = TestBed.inject(HttpTestingController);

      const dataSources: DataSource[] = [
        {
          id: 'source1',
          url: '/api/source1?existing=true',
          queryParams: { param1: 'value1' },
        },
      ];

      const promise = firstValueFrom(service.getTestReportsFromAllDataSources(dataSources));

      const req = httpMock.expectOne('/api/source1?existing=true&param1=value1');
      expect(req.request.method).toBe('GET');
      req.flush(mockTestReport);

      await promise;
    });
  });
});
