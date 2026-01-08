import { DistributionStrategy } from './distribution-strategy.interface';
import { ExecutionTypeDistributionStrategy } from './execution-type-distribution.strategy';
import {
  DurationDistributionStrategy,
  DurationDistributionStrategyParameters,
  DurationInterval,
} from './duration-distribution.strategy';

const defaultIntervals: DurationInterval[] = [
  {
    max: 1000,
    color: '#4CAF50',
  },
  {
    min: 1000,
    max: 5000,
    color: '#FFC107',
  },
  {
    min: 5000,
    color: '#F44336',
  },
];

export class DistributionStrategyFactory {
  private static readonly strategies = new Map<
    string,
    (strategyParameters?: DurationDistributionStrategyParameters) => DistributionStrategy
  >([
    ['status', () => new ExecutionTypeDistributionStrategy()],
    [
      'duration',
      (strategyParameters?: DurationDistributionStrategyParameters) => {
        const intervals = strategyParameters?.intervals ?? defaultIntervals;
        return new DurationDistributionStrategy({ ...strategyParameters, intervals });
      },
    ],
  ]);

  static create(
    type: string,
    strategyParameters?: DurationDistributionStrategyParameters,
  ): DistributionStrategy {
    const strategyCtor = this.strategies.get(type);
    if (!strategyCtor) {
      throw new Error(`Unknown distribution strategy type: ${type}`);
    }
    return strategyCtor(strategyParameters);
  }

  static register(
    type: string,
    strategyCtor: (
      strategyParameters?: DurationDistributionStrategyParameters,
    ) => DistributionStrategy,
  ): void {
    this.strategies.set(type, strategyCtor);
  }

  static getSupportedTypes(): string[] {
    return Array.from(this.strategies.keys());
  }
}
