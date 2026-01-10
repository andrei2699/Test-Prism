import { Test } from '../../../../../types/TestReport';
import { TestFilterStrategy } from './test-filter-strategy.interface';

export class TagFilterStrategy implements TestFilterStrategy {
  constructor(private readonly tags: string[]) {}

  filter(tests: Test[]): Test[] {
    if (!this.tags.length) {
      return tests;
    }

    const lowerCaseTags = this.tags.map(tag => tag.toLowerCase());

    return tests.filter(test => {
      const testLowerCaseTags = test.tags?.map(tag => tag.toLowerCase()) ?? [];

      return lowerCaseTags.every(tag => testLowerCaseTags.includes(tag));
    });
  }
}
