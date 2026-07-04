import { describe, test, expect } from 'vitest';

describe('Level 1 Suite', () => {
  describe('Level 2 Suite', () => {
    describe('Level 3 Suite', () => {
      test('nested test success', () => {
        expect(true).toBe(true);
      });
    });
  });
});
