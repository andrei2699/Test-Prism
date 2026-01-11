import { Component, computed, input } from '@angular/core';
import { DurationDistributionStrategyParameters } from './strategies/duration-distribution.strategy';
import { TestDistributionPie } from './test-distribution-pie/test-distribution-pie';
import { DistributionStrategy } from './strategies/distribution-strategy.interface';
import { DistributionStrategyFactory } from './strategies/distribution-strategy.factory';
import { TestColors } from '../../../types/Layout';
import { Test } from '../../../types/TestReport';
import { PieLegendParameters } from './parameters/LegendParameters';
import { PieDatasetParameters } from './parameters/DataSetParameters';
import { PieTitleFont, PieTitleOptions } from './parameters/TitleParameters';

export interface TestDistributionPieParameters {
  title?: string | PieTitleOptions;
  subTitle?: string | PieTitleOptions;
  strategy: 'status' | 'duration';
  strategyParameters?: DurationDistributionStrategyParameters;
  legend?: PieLegendParameters;
  dataset?: PieDatasetParameters;
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

  legend = computed<PieLegendParameters>(() => {
    return {
      position: 'right',
      ...this.parameters()?.legend,
    };
  });

  dataset = computed<PieDatasetParameters>(() => {
    return {
      borderColor: '#fff',
      borderWidth: 2,
      ...this.parameters()?.dataset,
    };
  });

  title = computed<PieTitleOptions | undefined>(() =>
    this.computeTitleOptions(this.parameters()?.title, {
      size: 20,
      weight: 'bold',
    }),
  );

  subTitle = computed<PieTitleOptions | undefined>(() =>
    this.computeTitleOptions(this.parameters()?.subTitle),
  );

  private computeTitleOptions(
    title?: string | PieTitleOptions,
    font?: PieTitleFont,
  ): PieTitleOptions | undefined {
    if (!title) {
      return undefined;
    }

    if (typeof title === 'string') {
      return {
        display: true,
        text: title,
        align: 'start',
        font: font,
      };
    }

    return title;
  }
}
