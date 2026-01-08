import { DataSourceId } from './DataSource';
import { TreeWidgetParameters } from '../components/widgets/tree-widget/tree-widget';
import { TestDistributionPieParameters } from '../components/widgets/test-distribution-pie/test-distribution-pie';

export type WidgetType = 'tree' | 'distribution-pie' | 'analysis-summary';

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

export type Widget = TreeWidget | TestDistributionWidget;

export interface WidgetData {
  dataSourceId: DataSourceId;
  filter?: DataFilter;
}

export interface DataFilter {
  // TODO: add missing properties
}
