import { LegendOptions } from 'chart.js';

type PieLegend = LegendOptions<'pie'>;

type Legend = Omit<PieLegend, 'onLeave' | 'onClick' | 'onHover' | 'labels'>;

type LegendLabels = Omit<PieLegend['labels'], 'generateLabels' | 'filter' | 'sort'>;

export type PieLegendParameters = Partial<Legend & { labels: Partial<LegendLabels> }>;
