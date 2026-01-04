import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestDataService } from './test-data.service';
import { TestReport } from '../types/TestReport';
import { provideHttpClient } from '@angular/common/http';

describe('TestDataService', () => {
  let service: TestDataService;
  let httpMock: HttpTestingController;

  const mockTestReport: TestReport = {
    version: 1,
    date: new Date(),
    tests: [
      {
        name: 'test 1',
        path: '/path/1',
        lastExecutionType: 'SUCCESS',
        durationMs: 100,
      },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        TestDataService,
      ],
    });

    service = TestBed.inject(TestDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should throw error when TEST_RESULTS_FILE env var is not set', async () => {
    delete (window as any).ENV;
    service.testData.reload();

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(service.testData.error()).toBeTruthy();
  });

  it('should load test data from environment variable path', async () => {
    const testFilePath = '/test-results.json';
    (window as any).ENV = { TEST_RESULTS_FILE: testFilePath };

    service.testData.reload();

    await new Promise(resolve => setTimeout(resolve, 50));
    const req = httpMock.expectOne(testFilePath);
    expect(req.request.method).toBe('GET');
    req.flush(mockTestReport);

    await new Promise(resolve => setTimeout(resolve, 50));
  });

  it('should handle missing TEST_RESULTS_FILE gracefully', async () => {
    (window as any).ENV = {};
    service.testData.reload();

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(service.testData.error()).toBeTruthy();
  });
});
