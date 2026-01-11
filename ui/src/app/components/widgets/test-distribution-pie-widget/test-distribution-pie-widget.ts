import { Component, computed, input } from '@angular/core';
import { DurationDistributionStrategyParameters } from './strategies/duration-distribution.strategy';
import { TestDistributionPie } from './test-distribution-pie/test-distribution-pie';
import { DistributionStrategy } from './strategies/distribution-strategy.interface';
import { DistributionStrategyFactory } from './strategies/distribution-strategy.factory';
import { TestColors } from '../../../types/Layout';
import { Test } from '../../../types/TestReport';
import { PieLegendParameters } from './parameters/LegendParameters';

export interface TestDistributionPieParameters {
  title?: string;
  strategy: 'status' | 'duration';
  strategyParameters?: DurationDistributionStrategyParameters;
  legendParameters?: PieLegendParameters;
}

@Component({
  selector: 'app-test-distribution-pie-widget',
  imports: [TestDistributionPie],
  templateUrl: './test-distribution-pie-widget.html',
  styleUrl: './test-distribution-pie-widget.css',
})
export class TestDistributionPieWidget {
  colors = input.required<TestColors>();
  tests = input.required<Test[]>();
  parameters = input.required<TestDistributionPieParameters | undefined>();

  strategy = computed<DistributionStrategy>(() => {
    const params = this.parameters();
    const strategy = params?.strategy ?? 'status';

    return DistributionStrategyFactory.create(strategy, params?.strategyParameters);
  });

  legendParameters = computed<PieLegendParameters>(() => {
    return {
      position: 'right',
      ...this.parameters()?.legendParameters,
    };
  });
}
