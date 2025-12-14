import { TreeSortStrategy } from './tree-sort-strategy.interface';
import { NameSortStrategy } from './name-sort.strategy';

export class TreeSortStrategyFactory {
  static create(type: string): TreeSortStrategy {
    switch (type) {
      case 'name':
        return new NameSortStrategy();
      default:
        throw new Error(`Unknown sort strategy: ${type}`);
    }
  }
}
