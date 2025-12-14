import { Component, input, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration } from 'chart.js';
import { Test } from '../../types/TestReport';
import { DistributionStrategyFactory, DistributionStrategyType } from './strategies/distribution-strategy.factory';
import { DistributionDataItem } from './strategies/distribution-data.interface';

interface PieChartData extends DistributionDataItem {
  percentage: number;
}

@Component({
  selector: 'app-test-distribution-pie',
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './test-distribution-pie.html',
  styleUrl: './test-distribution-pie.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestDistributionPie {
  private readonly distributionStrategyFactory = inject(DistributionStrategyFactory);

  tests = input.required<Test[]>();
  strategy = input<DistributionStrategyType>('execution-type');

  private distributionStrategy = computed(() => this.distributionStrategyFactory.getStrategy(this.strategy()));

  chartData = computed<PieChartData[]>(() => {
    const distribution: DistributionDataItem[] = this.distributionStrategy().calculateDistribution(this.tests());
    const total = this.tests().length;

    return distribution.map((item): PieChartData => ({
      ...item,
      percentage: total > 0 ? (item.count / total) * 100 : 0,
    }));
  });

  pieChartConfiguration = computed<ChartConfiguration<'pie'>>(() => {
    const data = this.chartData();

    return {
      type: 'pie',
      data: {
        labels: data.map(d => d.label),
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
            labels: {
              padding: 20,
              font: {
                size: 13,
              },
              generateLabels: (chart: Chart) => {
                const data = chart.data;
                if (!data.labels) {
                  return [];
                }
                return data.labels.map((label: any, index: number) => ({
                  text: `${label}: ${data.datasets[0].data[index]} (${this.getPercentageForLabel(label)}%)`,
                  fillStyle: (data.datasets[0].backgroundColor as string[])[index],
                  hidden: false,
                  index,
                }));
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              },
            },
          },
        },
      },
    };
  });

  private getPercentageForLabel(label: string): string {
    const data = this.chartData().find(d => d.label === label);
    return data ? data.percentage.toFixed(1) : '0.0';
  }
}
