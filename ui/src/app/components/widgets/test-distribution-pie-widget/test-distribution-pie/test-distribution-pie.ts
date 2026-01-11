import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, Plugin } from 'chart.js';
import { Test } from '../../../../types/TestReport';
import { DistributionDataItem } from '../strategies/distribution-data.interface';
import { DistributionStrategy } from '../strategies/distribution-strategy.interface';
import { TestColors } from '../../../../types/Layout';
import { PieLegendParameters } from '../parameters/LegendParameters';
import { PieDatasetParameters } from '../parameters/DataSetParameters';
import { PieTitleOptions } from '../parameters/TitleParameters';
import { PieOptionsParameters } from '../parameters/OptionsParameters';

interface PieChartData extends DistributionDataItem {
  percentage: number;
}

@Component({
  selector: 'app-test-distribution-pie',
  imports: [BaseChartDirective],
  templateUrl: './test-distribution-pie.html',
  styleUrl: './test-distribution-pie.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestDistributionPie {
  colors = input.required<TestColors>();
  tests = input.required<Test[]>();
  strategy = input.required<DistributionStrategy>();
  legend = input.required<PieLegendParameters>();
  dataset = input.required<PieDatasetParameters>();
  options = input<PieOptionsParameters>();
  title = input<PieTitleOptions>();
  subTitle = input<PieTitleOptions>();
  width = input<string>();
  height = input<string>();
  shouldDisplayInnerPercentage = input<boolean>();

  chartData = computed<PieChartData[]>(() => {
    const distribution: DistributionDataItem[] = this.strategy().calculateDistribution(
      this.tests(),
      this.colors(),
    );
    const total = this.tests().length;

    return distribution.map(
      (item): PieChartData => ({
        ...item,
        percentage: total > 0 ? (item.count / total) * 100 : 0,
      }),
    );
  });

  plugins = computed<Plugin<'pie'>[]>(() => {
    const plugins: Plugin<'pie'>[] = [];

    if (this.shouldDisplayInnerPercentage()) {
      plugins.push(getTextCenterPlugin());
    }

    return plugins;
  });

  pieChartConfiguration = computed<ChartConfiguration<'pie'>>(() => {
    const data = this.chartData();

    return {
      type: 'pie',
      data: {
        labels: data.map(d => `${d.label} (${d.percentage.toFixed(2)}%)`),
        datasets: [
          {
            ...this.dataset(),
            data: data.map(d => d.count),
            backgroundColor: data.map(d => d.color),
          },
        ],
      },
      options: {
        ...this.options(),
        cutout: '50%',
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          title: this.title(),
          subtitle: this.subTitle(),
          legend: {
            ...this.legend(),
          },
        },
      },
    };
  });
}

function getTextCenterPlugin(): Plugin<'pie'> {
  return {
    id: 'textCenter',
    beforeDatasetDraw: chart => {
      const { ctx, data } = chart;
      ctx.save();
      ctx.font = 'bolder 1rem sans-serif';

      const backgroundColorArray: string[] = data.datasets[0].backgroundColor as string[];
      ctx.fillStyle = backgroundColorArray[0];
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const sum = data.datasets[0].data.reduce((a, b) => a + b, 0);
      const successPercentage = (data.datasets[0].data[0] / sum) * 100;

      ctx.fillText(
        `${successPercentage.toFixed(2)}%`,
        chart.getDatasetMeta(0).data[0].x,
        chart.getDatasetMeta(0).data[0].y,
      );
    },
  };
}
