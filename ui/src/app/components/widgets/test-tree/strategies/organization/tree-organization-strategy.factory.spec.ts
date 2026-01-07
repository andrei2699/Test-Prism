import { TreeOrganizationStrategyFactory } from './tree-organization-strategy.factory';

import { TreeOrganizationStrategy } from './tree-organization-strategy.interface';
import { TestTreeNode } from '../../test-tree';
import { FolderOrganizationStrategy } from './folder-organization.strategy';
import { ExecutionTypeOrganizationStrategy } from './execution-type-organization.strategy';

describe('TreeOrganizationStrategyFactory', () => {
  it('should create FolderOrganizationStrategy for folder type', () => {
    const strategy = TreeOrganizationStrategyFactory.create('folder');
    expect(strategy).toBeInstanceOf(FolderOrganizationStrategy);
  });

  it('should create ExecutionTypeOrganizationStrategy for status type', () => {
    const strategy = TreeOrganizationStrategyFactory.create('status');
    expect(strategy).toBeInstanceOf(ExecutionTypeOrganizationStrategy);
  });

  it('should default to FolderOrganizationStrategy for unknown type', () => {
    const strategy = TreeOrganizationStrategyFactory.create('unknown');
    expect(strategy).toBeInstanceOf(FolderOrganizationStrategy);
  });

  it('should register custom strategies', () => {
    class CustomStrategy implements TreeOrganizationStrategy {
      getName(): string {
        return 'custom';
      }

      buildTree(): TestTreeNode[] {
        return [];
      }

      getIcon(): string {
        return 'folder';
      }

      getColor(): string {
        return 'inherit';
      }
    }

    TreeOrganizationStrategyFactory.register('custom', () => new CustomStrategy());
    const strategy = TreeOrganizationStrategyFactory.create('custom');

    expect(strategy).toBeInstanceOf(CustomStrategy);
  });

  it('should return supported types', () => {
    const types = TreeOrganizationStrategyFactory.getSupportedTypes();
    expect(types).toContain('folder');
    expect(types).toContain('status');
  });

  it('should not duplicate strategies on register', () => {
    class AnotherStrategy implements TreeOrganizationStrategy {
      getName(): string {
        return 'another';
      }

      buildTree(): TestTreeNode[] {
        return [];
      }

      getIcon(): string {
        return 'folder';
      }

      getColor(): string {
        return 'inherit';
      }
    }

    TreeOrganizationStrategyFactory.register('another', () => new AnotherStrategy());
    TreeOrganizationStrategyFactory.register('another', () => new AnotherStrategy());

    const strategy = TreeOrganizationStrategyFactory.create('another');
    expect(strategy).toBeInstanceOf(AnotherStrategy);
  });
});
