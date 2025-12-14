import { Injectable } from '@angular/core';
import { DistributionStrategy } from './distribution-strategy.interface';
import { ExecutionTypeDistributionStrategy } from './execution-type-distribution.strategy';

export type DistributionStrategyType = 'execution-type';

@Injectable({ providedIn: 'root' })
export class DistributionStrategyFactory {
  private readonly strategies: Record<DistributionStrategyType, DistributionStrategy> = {
    'execution-type': new ExecutionTypeDistributionStrategy(),
  };

  getStrategy(type: DistributionStrategyType): DistributionStrategy {
    const strategy = this.strategies[type];
    if (!strategy) {
      throw new Error(`Unknown distribution strategy type: ${type}`);
    }
    return strategy;
  }
}
