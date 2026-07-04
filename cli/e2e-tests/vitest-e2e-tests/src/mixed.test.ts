import { describe, test, expect } from 'vitest';

describe('Mixed Suite', () => {
  test('passed test', () => {
    expect(1).toBe(1);
  });

  test('failed test', () => {
    expect(1).toBe(2);
  });

  test.skip('skipped test', () => {
    expect(3).toBe(3);
  });
});
