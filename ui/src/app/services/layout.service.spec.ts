import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LayoutService } from './layout.service';
import { Layout } from '../types/Layout';

describe('LayoutService', () => {
  let service: LayoutService;
  let httpMock: HttpTestingController;

  const mockLayout: Layout = {
    pages: [],
    dataSources: [],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), LayoutService],
    });

    service = TestBed.inject(LayoutService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should throw error when LAYOUT_FILE env var is not set', async () => {
    delete (window as any).ENV;
    service.layout.reload();

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(service.layout.error()).toBeTruthy();
  });

  it('should load test data from environment variable path', async () => {
    const testFilePath = '/layout.json';
    (window as any).ENV = { LAYOUT_FILE: testFilePath };

    service.layout.reload();

    await new Promise(resolve => setTimeout(resolve, 50));
    const req = httpMock.expectOne(testFilePath);
    expect(req.request.method).toBe('GET');
    req.flush(mockLayout);

    await new Promise(resolve => setTimeout(resolve, 50));
  });

  it('should handle missing LAYOUT_FILE gracefully', async () => {
    (window as any).ENV = {};
    service.layout.reload();

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(service.layout.error()).toBeTruthy();
  });
});
