import { DistributionStrategy } from './distribution-strategy.interface';
import { ExecutionTypeDistributionStrategy } from './execution-type-distribution.strategy';

export class DistributionStrategyFactory {
  private static readonly strategies = new Map<string, () => DistributionStrategy>([
    ['status', () => new ExecutionTypeDistributionStrategy()],
  ]);

  static create(type: string): DistributionStrategy {
    const strategyCtor = this.strategies.get(type);
    if (!strategyCtor) {
      throw new Error(`Unknown distribution strategy type: ${type}`);
    }
    return strategyCtor();
  }

  static register(type: string, strategyCtor: () => DistributionStrategy): void {
    this.strategies.set(type, strategyCtor);
  }

  static getSupportedTypes(): string[] {
    return Array.from(this.strategies.keys());
  }
}
