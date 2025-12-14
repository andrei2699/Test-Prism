import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { Test } from '../../types/TestReport';
import { DistributionDataItem } from './strategies/distribution-data.interface';
import { DistributionStrategy } from './strategies/distribution-strategy.interface';
import { DistributionStrategyFactory } from './strategies/distribution-strategy.factory';

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
  tests = input.required<Test[]>();
  strategy = input<DistributionStrategy>(DistributionStrategyFactory.create('status'));

  chartData = computed<PieChartData[]>(() => {
    const distribution: DistributionDataItem[] = this.strategy().calculateDistribution(
      this.tests(),
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
            data: data.map(d => d.count),
            backgroundColor: data.map(d => d.color),
            borderColor: '#fff',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'right' as const,
          },
        },
      },
    };
  });
}
