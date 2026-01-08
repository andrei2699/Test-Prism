import { TestBed } from '@angular/core/testing';
import { DataFilterService } from './data-filter.service';
import { Test } from '../types/TestReport';
import { DataFilter } from '../types/Widget';

describe('DataFilterService', () => {
  let service: DataFilterService;
  let tests: Test[];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataFilterService);

    tests = [
      {
        name: 'Test 1',
        lastExecutionType: 'SUCCESS',
        durationMs: 100,
        path: 'path/to/test1',
        tags: ['fast', 'smoke'],
      },
      {
        name: 'Test 2',
        lastExecutionType: 'FAILURE',
        durationMs: 200,
        path: 'path/to/test2',
        tags: ['slow'],
      },
      {
        name: 'Another Test',
        lastExecutionType: 'SUCCESS',
        durationMs: 150,
        path: 'path/to/another',
        tags: ['smoke', 'regression'],
      },
      {
        name: 'Skipped Test',
        lastExecutionType: 'SKIPPED',
        durationMs: 50,
        path: 'path/to/skipped',
        tags: [],
      },
      {
        name: 'Null Tag Test',
        lastExecutionType: 'SUCCESS',
        durationMs: 120,
        path: 'path/to/null',
        tags: undefined,
      },
      {
        name: 'Nested Test',
        lastExecutionType: 'SUCCESS',
        durationMs: 110,
        path: 'path/to/nested',
        tags: [],
      },
    ];
  });

  it('should return all tests if filter is null', () => {
    const result = service.applyFilter(tests, null);

    expect(result).toEqual(tests);
  });

  it('should return all tests if filter is undefined', () => {
    const result = service.applyFilter(tests, undefined);

    expect(result).toEqual(tests);
  });

  it('should return all tests if filter conditions are empty', () => {
    const filter: DataFilter = { operator: 'AND', conditions: [] };

    const result = service.applyFilter(tests, filter);

    expect(result).toEqual(tests);
  });

  describe('Operators', () => {
    it('should filter with "equals"', () => {
      const filter: DataFilter = {
        operator: 'AND',
        conditions: [{ field: 'lastExecutionType', operator: 'equals', value: 'FAILURE' }],
      };

      const result = service.applyFilter(tests, filter);

      expect(result).toEqual([tests[1]]);
    });

    it('should filter with "==" as an alias for "equals"', () => {
      const filter: DataFilter = {
        operator: 'AND',
        conditions: [{ field: 'lastExecutionType', operator: '==', value: 'FAILURE' }],
      };

      const result = service.applyFilter(tests, filter);

      expect(result).toEqual([tests[1]]);
    });

    it('should filter with "not equals"', () => {
      const filter: DataFilter = {
        operator: 'AND',
        conditions: [{ field: 'lastExecutionType', operator: 'not equals', value: 'SUCCESS' }],
      };

      const result = service.applyFilter(tests, filter);

      expect(result).toEqual([tests[1], tests[3]]);
    });

    it('should filter with "!=" as an alias for "not equals"', () => {
      const filter: DataFilter = {
        operator: 'AND',
        conditions: [{ field: 'lastExecutionType', operator: '!=', value: 'SUCCESS' }],
      };

      const result = service.applyFilter(tests, filter);

      expect(result).toEqual([tests[1], tests[3]]);
    });

    it('should filter with "in"', () => {
      const filter: DataFilter = {
        operator: 'AND',
        conditions: [{ field: 'lastExecutionType', operator: 'in', value: ['FAILURE', 'SKIPPED'] }],
      };

      const result = service.applyFilter(tests, filter);

      expect(result).toEqual([tests[1], tests[3]]);
    });

    it('should filter with "not in"', () => {
      const filter: DataFilter = {
        operator: 'AND',
        conditions: [
          { field: 'lastExecutionType', operator: 'not in', value: ['SUCCESS', 'SKIPPED'] },
        ],
      };

      const result = service.applyFilter(tests, filter);

      expect(result).toEqual([tests[1]]);
    });

    it('should filter with "contains" on a string property', () => {
      const filter: DataFilter = {
        operator: 'AND',
        conditions: [{ field: 'name', operator: 'contains', value: 'Another' }],
      };

      const result = service.applyFilter(tests, filter);

      expect(result).toEqual([tests[2]]);
    });

    it('should filter with "contains" on an array property', () => {
      const filter: DataFilter = {
        operator: 'AND',
        conditions: [{ field: 'tags', operator: 'contains', value: 'smoke' }],
      };

      const result = service.applyFilter(tests, filter);

      expect(result).toEqual([tests[0], tests[2]]);
    });
  });

  describe('Logical Combinations', () => {
    it('should filter with AND operator', () => {
      const filter: DataFilter = {
        operator: 'AND',
        conditions: [
          { field: 'lastExecutionType', operator: 'equals', value: 'SUCCESS' },
          { field: 'durationMs', operator: 'equals', value: 150 },
        ],
      };

      const result = service.applyFilter(tests, filter);

      expect(result).toEqual([tests[2]]);
    });

    it('should filter with OR operator', () => {
      const filter: DataFilter = {
        operator: 'OR',
        conditions: [
          { field: 'lastExecutionType', operator: 'equals', value: 'FAILURE' },
          { field: 'lastExecutionType', operator: 'equals', value: 'SKIPPED' },
        ],
      };

      const result = service.applyFilter(tests, filter);

      expect(result).toEqual([tests[1], tests[3]]);
    });
  });

  describe('Nested Filters', () => {
    it('should handle a nested AND filter within an OR filter', () => {
      const filter: DataFilter = {
        operator: 'OR',
        conditions: [
          {
            operator: 'AND',
            conditions: [
              { field: 'lastExecutionType', operator: 'equals', value: 'SUCCESS' },
              { field: 'name', operator: 'contains', value: '1' },
            ],
          },
          { field: 'lastExecutionType', operator: 'equals', value: 'SKIPPED' },
        ],
      };

      const result = service.applyFilter(tests, filter);

      expect(result).toEqual([tests[0], tests[3]]);
    });

    it('should handle a nested OR filter within an AND filter', () => {
      const filter: DataFilter = {
        operator: 'AND',
        conditions: [
          { field: 'lastExecutionType', operator: 'equals', value: 'SUCCESS' },
          {
            operator: 'OR',
            conditions: [
              { field: 'name', operator: 'contains', value: 'Another' },
              { field: 'durationMs', operator: 'equals', value: 100 },
            ],
          },
        ],
      };

      const result = service.applyFilter(tests, filter);

      expect(result).toEqual([tests[0], tests[2]]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle dot notation for a nested field', () => {
      const filter: DataFilter = {
        operator: 'AND',
        conditions: [{ field: 'details.author', operator: 'equals', value: 'Jane' }],
      };

      const result = service.applyFilter(tests, filter);

      expect(result).toEqual([tests[5]]);
    });

    it('should handle a null value in the data', () => {
      const filter: DataFilter = {
        operator: 'AND',
        conditions: [{ field: 'tags', operator: 'equals', value: null }],
      };

      const result = service.applyFilter(tests, filter);

      expect(result).toEqual([tests[4]]);
    });

    it('should not find a value in a null array property', () => {
      const filter: DataFilter = {
        operator: 'AND',
        conditions: [{ field: 'tags', operator: 'contains', value: 'non-existent' }],
      };

      const result = service.applyFilter(tests, filter);

      expect(result).toEqual([]);
    });

    it('should correctly filter for an empty array value', () => {
      const filter: DataFilter = {
        operator: 'AND',
        conditions: [{ field: 'tags', operator: 'equals', value: [] }],
      };

      const result = service.applyFilter(tests, filter);

      expect(result).toEqual([tests[3], tests[5]]);
    });
  });
});
