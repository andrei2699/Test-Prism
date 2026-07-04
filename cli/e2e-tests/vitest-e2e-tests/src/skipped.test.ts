import { test, expect } from 'vitest';

test.skip('skipped test', () => {
  expect(1).toBe(1);
});
