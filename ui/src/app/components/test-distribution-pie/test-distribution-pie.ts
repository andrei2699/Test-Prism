import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration } from 'chart.js';
import { Test, TestExecutionType } from '../../types/TestReport';
import { EXECUTION_TYPE_COLORS } from '../../shared/execution-type-colors';

interface PieChartData {
  executionType: TestExecutionType;
  count: number;
  percentage: number;
  color: string;
}

@Component({
  selector: 'app-test-distribution-pie',
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './test-distribution-pie.html',
  styleUrl: './test-distribution-pie.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestDistributionPie {
  tests = input.required<Test[]>();

  chartData = computed<PieChartData[]>(() => {
    const distribution = this.calculateDistribution();
    const total = this.tests().length;

    return distribution.map(({ executionType, count }) => ({
      executionType,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
      color: EXECUTION_TYPE_COLORS[executionType],
    }));
  });

  pieChartConfiguration = computed<ChartConfiguration<'pie'>>(() => {
    const data = this.chartData();

    return {
      type: 'pie',
      data: {
        labels: data.map(d => d.executionType),
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
    const data = this.chartData().find(d => d.executionType === label);
    return data ? data.percentage.toFixed(1) : '0.0';
  }

  private calculateDistribution(): Array<{ executionType: TestExecutionType; count: number }> {
    const counts: Record<TestExecutionType, number> = {
      SUCCESS: 0,
      FAILURE: 0,
      ERROR: 0,
      SKIPPED: 0,
    };

    this.tests().forEach(test => {
      counts[test.lastExecutionType]++;
    });

    const statusOrder: TestExecutionType[] = ['SUCCESS', 'FAILURE', 'SKIPPED', 'ERROR'];
    return statusOrder
      .map(executionType => ({
        executionType,
        count: counts[executionType],
      }))
      .filter(item => item.count > 0);
  }
}
