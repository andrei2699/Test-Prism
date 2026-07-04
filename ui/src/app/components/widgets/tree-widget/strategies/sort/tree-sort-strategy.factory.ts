import { TreeSortStrategy } from './tree-sort-strategy.interface';
import { NameSortStrategy } from './name-sort.strategy';
import { FolderSortStrategy } from './folder-sort.strategy';

export class TreeSortStrategyFactory {
  static create(type: string): TreeSortStrategy {
    switch (type) {
      case 'name':
        return new NameSortStrategy();
      case 'folder':
        return new FolderSortStrategy();
      default:
        throw new Error(`Unknown sort strategy: ${type}`);
    }
  }
}
