import {
  FontSpec,
  ScriptableAndScriptableOptions,
  ScriptableChartContext,
  TitleOptions,
} from 'chart.js';

export type PieTitleFont = ScriptableAndScriptableOptions<
  Partial<FontSpec>,
  ScriptableChartContext
>;

export type PieTitleOptions = Partial<TitleOptions>;
