import { TagFilterStrategy } from './tag-filter.strategy';
import { Test } from '../../../../../types/TestReport';

describe('TagFilterStrategy', () => {
  it('should filter tests by a single tag', () => {
    const tests: Test[] = [
      {
        name: 'test1',
        path: 'path1',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        tags: ['tag1', 'tag2'],
      },
      {
        name: 'test2',
        path: 'path2',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        tags: ['tag2'],
      },
      {
        name: 'test3',
        path: 'path3',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        tags: ['tag1'],
      },
    ];

    const strategy = new TagFilterStrategy(['tag1']);
    const filteredTests = strategy.filter(tests);

    expect(filteredTests).toEqual([
      {
        name: 'test1',
        path: 'path1',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        tags: ['tag1', 'tag2'],
      },
      {
        name: 'test3',
        path: 'path3',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        tags: ['tag1'],
      },
    ]);
  });

  it('should filter tests by tag case insensitive', () => {
    const tests: Test[] = [
      {
        name: 'test1',
        path: 'path1',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        tags: ['tag1', 'tag2'],
      },
      {
        name: 'test2',
        path: 'path2',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        tags: ['tag2'],
      },
      {
        name: 'test3',
        path: 'path3',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        tags: ['tag1'],
      },
    ];

    const strategy = new TagFilterStrategy(['TAG1']);
    const filteredTests = strategy.filter(tests);

    expect(filteredTests).toEqual([
      {
        name: 'test1',
        path: 'path1',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        tags: ['tag1', 'tag2'],
      },
      {
        name: 'test3',
        path: 'path3',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        tags: ['tag1'],
      },
    ]);
  });

  it('should filter tests by multiple tags', () => {
    const tests: Test[] = [
      {
        name: 'test1',
        path: 'path1',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        tags: ['tag1', 'tag2'],
      },
      {
        name: 'test2',
        path: 'path2',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        tags: ['tag2'],
      },
      {
        name: 'test3',
        path: 'path3',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        tags: ['tag1'],
      },
    ];

    const strategy = new TagFilterStrategy(['tag1', 'tag2']);
    const filteredTests = strategy.filter(tests);

    expect(filteredTests).toEqual([
      {
        name: 'test1',
        path: 'path1',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        tags: ['tag1', 'tag2'],
      },
    ]);
  });

  it('should return all tests if no tags are provided', () => {
    const tests: Test[] = [
      {
        name: 'test1',
        path: 'path1',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        tags: ['tag1', 'tag2'],
      },
      {
        name: 'test2',
        path: 'path2',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        tags: ['tag2'],
      },
      {
        name: 'test3',
        path: 'path3',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        tags: ['tag1'],
      },
    ];

    const strategy = new TagFilterStrategy([]);
    const filteredTests = strategy.filter(tests);

    expect(filteredTests).toEqual(tests);
  });

  it('should return an empty array if no tests match the tags', () => {
    const tests: Test[] = [
      {
        name: 'test1',
        path: 'path1',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        tags: ['tag1', 'tag2'],
      },
      {
        name: 'test2',
        path: 'path2',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        tags: ['tag2'],
      },
      {
        name: 'test3',
        path: 'path3',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        tags: ['tag1'],
      },
    ];

    const strategy = new TagFilterStrategy(['tag3']);
    const filteredTests = strategy.filter(tests);

    expect(filteredTests).toEqual([]);
  });

  it('should handle tests with no tags property', () => {
    const tests: Test[] = [
      {
        name: 'test1',
        path: 'path1',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        tags: ['tag1', 'tag2'],
      },
      {
        name: 'test2',
        path: 'path2',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
      },
      {
        name: 'test3',
        path: 'path3',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        tags: ['tag1'],
      },
    ];

    const strategy = new TagFilterStrategy(['tag1']);
    const filteredTests = strategy.filter(tests);

    expect(filteredTests).toEqual([
      {
        name: 'test1',
        path: 'path1',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        tags: ['tag1', 'tag2'],
      },
      {
        name: 'test3',
        path: 'path3',
        executions: [{ timestamp: '2023-01-01T00:00:00Z', status: 'SUCCESS', durationMs: 100 }],
        tags: ['tag1'],
      },
    ]);
  });
});
