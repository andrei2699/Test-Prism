import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { DistributionStrategyFactory } from './distribution-strategy.factory';
import { ExecutionTypeDistributionStrategy } from './execution-type-distribution.strategy';

describe('DistributionStrategyFactory', () => {
  let factory: DistributionStrategyFactory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DistributionStrategyFactory],
    });
    factory = TestBed.inject(DistributionStrategyFactory);
  });

  it('should return an ExecutionTypeDistributionStrategy', () => {
    const strategy = factory.getStrategy('execution-type');
    expect(strategy).toBeInstanceOf(ExecutionTypeDistributionStrategy);
  });

  it('should throw an error for an unknown strategy type', () => {
    expect(() => factory.getStrategy('unknown' as any)).toThrow('Unknown distribution strategy type: unknown');
  });
});
