import { TreeOrganizationStrategy } from './tree-organization-strategy.interface';
import { FolderOrganizationStrategy } from './folder-organization.strategy';
import { ExecutionTypeOrganizationStrategy } from './execution-type-organization.strategy';

export class TreeOrganizationStrategyFactory {
  private static readonly strategies = new Map<string, () => TreeOrganizationStrategy>([
    ['folder', () => new FolderOrganizationStrategy()],
    ['status', () => new ExecutionTypeOrganizationStrategy()],
  ]);

  static create(type: string): TreeOrganizationStrategy {
    const strategyCtor = this.strategies.get(type);
    if (!strategyCtor) {
      console.warn(`Unknown organization type: ${type}, defaulting to 'folder'`);
      return new FolderOrganizationStrategy();
    }
    return strategyCtor();
  }

  static register(type: string, strategyCtor: () => TreeOrganizationStrategy): void {
    this.strategies.set(type, strategyCtor);
  }

  static getSupportedTypes(): string[] {
    return Array.from(this.strategies.keys());
  }
}
