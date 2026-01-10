import { DataSourceId } from './DataSource';
import { TreeWidgetParameters } from '../components/widgets/tree-widget/tree-widget';
import { TestDistributionPieParameters } from '../components/widgets/test-distribution-pie-widget/test-distribution-pie-widget';
import { SummaryWidgetParameters } from '../components/widgets/summary-widget/summary-widget';

export type WidgetType = 'container' | 'tree' | 'distribution-pie' | 'summary';

interface BaseWidget {
  id: string;
  type: WidgetType;
  data: WidgetData;
  style?: CSSStyleDeclaration;
}

interface TreeWidget extends BaseWidget {
  type: 'tree';
  parameters?: TreeWidgetParameters;
}

interface TestDistributionWidget extends BaseWidget {
  type: 'distribution-pie';
  parameters?: TestDistributionPieParameters;
}

export interface SummaryWidget extends BaseWidget {
  type: 'summary';
  parameters?: SummaryWidgetParameters;
}

export interface ContainerWidget extends BaseWidget {
  type: 'container';
  children: Widget[];
}

export type Widget = TreeWidget | TestDistributionWidget | ContainerWidget | SummaryWidget;

export interface WidgetData {
  dataSourceId: DataSourceId;
  filter?: DataFilter;
}

export type LogicalOperator = 'AND' | 'OR';
export type ConditionOperator =
  | '=='
  | 'equals'
  | '!='
  | 'not equals'
  | 'in'
  | 'not in'
  | 'contains'
  | '>='
  | '>'
  | '<'
  | '<=';

export type FieldValue = object | string | number | boolean | null | FieldValue[];

export interface Condition {
  field: string;
  operator: ConditionOperator;
  value: FieldValue;
}

export interface DataFilter {
  operator: LogicalOperator;
  conditions: (DataFilter | Condition)[];
}
