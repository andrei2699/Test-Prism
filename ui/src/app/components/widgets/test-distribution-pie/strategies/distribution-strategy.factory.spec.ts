import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DistributionStrategyFactory } from './distribution-strategy.factory';
import { ExecutionTypeDistributionStrategy } from './execution-type-distribution.strategy';
import { DistributionStrategy } from './distribution-strategy.interface';
import { Test } from '../../../../types/TestReport';
import { DistributionDataItem } from './distribution-data.interface';

class MockDistributionStrategy implements DistributionStrategy {
  calculateDistribution(tests: Test[]): DistributionDataItem[] {
    return [{ label: 'Mock', count: tests.length, color: '#000000' }];
  }
}

describe('DistributionStrategyFactory', () => {
  let originalStrategies: Map<string, () => DistributionStrategy>;

  beforeEach(() => {
    originalStrategies = (DistributionStrategyFactory as any).strategies;
    (DistributionStrategyFactory as any).strategies = new Map<string, () => DistributionStrategy>([
      ['status', () => new ExecutionTypeDistributionStrategy()],
    ]);
  });

  afterEach(() => {
    (DistributionStrategyFactory as any).strategies = originalStrategies;
  });

  it('should return an ExecutionTypeDistributionStrategy for "status" type', () => {
    const strategy = DistributionStrategyFactory.create('status');
    expect(strategy).toBeInstanceOf(ExecutionTypeDistributionStrategy);
  });

  it('should throw an error for an unknown strategy type', () => {
    expect(() => DistributionStrategyFactory.create('unknown' as any)).toThrow(
      'Unknown distribution strategy type: unknown',
    );
  });

  it('should allow registering a new strategy', () => {
    const newStrategyType: string = 'mock-strategy' as any;
    const newStrategyCtor = () => new MockDistributionStrategy();

    DistributionStrategyFactory.register(newStrategyType, newStrategyCtor);

    const strategy = DistributionStrategyFactory.create(newStrategyType);
    expect(strategy).toBeInstanceOf(MockDistributionStrategy);
  });

  it('should return all supported strategy types', () => {
    const newStrategyType: string = 'mock-strategy' as any;
    const newStrategyCtor = () => new MockDistributionStrategy();
    DistributionStrategyFactory.register(newStrategyType, newStrategyCtor);

    const supportedTypes = DistributionStrategyFactory.getSupportedTypes();
    expect(supportedTypes).toEqual(['status', 'mock-strategy']);
  });
});
