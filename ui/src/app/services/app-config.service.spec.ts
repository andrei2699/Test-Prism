import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AppConfig, AppConfigService } from './app-config.service';

describe('AppConfigService', () => {
  let service: AppConfigService;
  let httpMock: HttpTestingController;

  const mockConfig: AppConfig = {
    layoutUrl: '/layout.json',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), AppConfigService],
    });

    service = TestBed.inject(AppConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should load configuration from /app-config.json', async () => {
    const loadPromise = service.loadConfig();

    const req = httpMock.expectOne('/app-config.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockConfig);

    await loadPromise;

    expect(service.config).toEqual(mockConfig);
  });

  it('should handle error when loading configuration fails', async () => {
    const loadPromise = service.loadConfig();

    const req = httpMock.expectOne('/app-config.json');
    req.flush('Error', { status: 404, statusText: 'Not Found' });

    await loadPromise;

    expect(service.config).toBeNull();
  });
});
