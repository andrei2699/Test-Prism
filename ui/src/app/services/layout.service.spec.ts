import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { LayoutService } from './layout.service';
import { AppConfigService } from './app-config.service';

describe('LayoutService', () => {
  let service: LayoutService;
  let appConfigService: AppConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LayoutService, AppConfigService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(LayoutService);
    appConfigService = TestBed.inject(AppConfigService);
  });

  it('should throw error when layoutUrl is not configured', () => {
    appConfigService.config = null;

    expect(() => {
      service.layout.value();
    }).toThrow('Layout URL is not configured in app-config.json');
  });
});
