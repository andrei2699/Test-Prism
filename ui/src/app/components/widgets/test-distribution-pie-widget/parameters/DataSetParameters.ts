import { ChartDataset } from 'chart.js';

type PieDataset = ChartDataset<'pie', number[]>;

type Dataset = Omit<PieDataset, 'data' | 'backgroundColor'>;

export type PieDatasetParameters = Partial<Dataset>;
