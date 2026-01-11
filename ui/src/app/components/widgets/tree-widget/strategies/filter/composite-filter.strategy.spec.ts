import { describe, expect, it } from 'vitest';
import { CompositeFilterStrategy } from './composite-filter.strategy';
import { NameFilterStrategy } from './name-filter.strategy';
import { StatusFilterStrategy } from './status-filter.strategy';
import { Test } from '../../../../../types/TestReport';

describe('CompositeFilterStrategy', () => {
  const testData: Test[] = [
    {
      name: 'LoginComponent.spec.ts',
      path: 'src/auth',
      executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 100 }],
    },
    {
      name: 'UserService.spec.ts',
      path: 'src/services',
      executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'PASSED', durationMs: 100 }],
    },
    {
      name: 'LoginPage.spec.ts',
      path: 'src/pages',
      executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'FAILED', durationMs: 100 }],
    },
    {
      name: 'SkippedTest.spec.ts',
      path: 'src/tests',
      executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SKIPPED', durationMs: 100 }],
    },
  ];

  it('should apply no filters when empty', () => {
    const strategy = new CompositeFilterStrategy([]);
    const result = strategy.filter(testData);

    expect(result).toHaveLength(4);
  });

  it('should apply single filter correctly', () => {
    const nameFilter = new NameFilterStrategy('Login');
    const strategy = new CompositeFilterStrategy([nameFilter]);
    const result = strategy.filter(testData);

    expect(result).toHaveLength(2);
  });

  it('should apply multiple filters in sequence', () => {
    const nameFilter = new NameFilterStrategy('Login');
    const statusFilter = new StatusFilterStrategy(['PASSED']);
    const strategy = new CompositeFilterStrategy([nameFilter, statusFilter]);
    const result = strategy.filter(testData);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('LoginComponent.spec.ts');
  });

  it('should return empty when filters eliminate all tests', () => {
    const nameFilter = new NameFilterStrategy('Skipped');
    const statusFilter = new StatusFilterStrategy(['PASSED']);
    const strategy = new CompositeFilterStrategy([nameFilter, statusFilter]);
    const result = strategy.filter(testData);

    expect(result).toHaveLength(0);
  });

  it('should maintain test order through filter chain', () => {
    const statusFilter = new StatusFilterStrategy(['PASSED', 'FAILED']);
    const strategy = new CompositeFilterStrategy([statusFilter]);
    const result = strategy.filter(testData);

    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toBe(testData[0]);
  });
});
