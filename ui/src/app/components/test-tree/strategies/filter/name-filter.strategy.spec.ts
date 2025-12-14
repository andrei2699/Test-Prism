import { describe, it, expect } from 'vitest';
import { NameFilterStrategy } from './name-filter.strategy';
import { Test } from '../../../../types/TestReport';

describe('NameFilterStrategy', () => {
  const testData: Test[] = [
    { name: 'LoginComponent.spec.ts', path: 'src/auth', lastExecutionType: 'SUCCESS' },
    { name: 'UserService.spec.ts', path: 'src/services', lastExecutionType: 'SUCCESS' },
    { name: 'LoginPage.spec.ts', path: 'src/pages', lastExecutionType: 'FAILURE' },
  ];

  it('should return all tests when filter is empty', () => {
    const strategy = new NameFilterStrategy('');
    const result = strategy.filter(testData);
    expect(result).toHaveLength(3);
  });

  it('should filter tests by name containing filter text', () => {
    const strategy = new NameFilterStrategy('Login');
    const result = strategy.filter(testData);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('LoginComponent.spec.ts');
    expect(result[1].name).toBe('LoginPage.spec.ts');
  });

  it('should be case insensitive', () => {
    const strategy = new NameFilterStrategy('login');
    const result = strategy.filter(testData);
    expect(result).toHaveLength(2);
  });

  it('should return empty array when no matches found', () => {
    const strategy = new NameFilterStrategy('NonExistent');
    const result = strategy.filter(testData);
    expect(result).toHaveLength(0);
  });

  it('should trim whitespace from filter text', () => {
    const strategy = new NameFilterStrategy('  Service  ');
    const result = strategy.filter(testData);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('UserService.spec.ts');
  });
});
