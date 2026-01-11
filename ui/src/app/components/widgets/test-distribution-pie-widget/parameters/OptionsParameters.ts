import { ChartOptions } from 'chart.js';

export type Options = Omit<
  ChartOptions<'pie'>,
  'onHover' | 'onClick' | 'onResize' | 'plugins' | 'responsive' | 'maintainAspectRatio'
>;

export type PieOptionsParameters = Partial<Options>;
