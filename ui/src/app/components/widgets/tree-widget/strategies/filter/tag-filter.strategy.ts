import { Test } from '../../../../../types/TestReport';
import { TestFilterStrategy } from './test-filter-strategy.interface';

export class TagFilterStrategy implements TestFilterStrategy {
  constructor(private readonly tags: string[]) {}

  filter(tests: Test[]): Test[] {
    if (!this.tags.length) {
      return tests;
    }

    return tests.filter(test => {
      return this.tags.every(tag => test.tags?.includes(tag));
    });
  }
}
