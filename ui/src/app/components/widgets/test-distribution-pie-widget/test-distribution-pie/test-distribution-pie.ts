import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { Test } from '../../../../types/TestReport';
import { DistributionDataItem } from '../strategies/distribution-data.interface';
import { DistributionStrategy } from '../strategies/distribution-strategy.interface';
import { TestColors } from '../../../../types/Layout';
import { PieLegendParameters } from '../parameters/LegendParameters';
import { PieDatasetParameters } from '../parameters/DataSetParameters';

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
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            ...this.legend(),
          },
        },
      },
    };
  });
}
