import { Component, signal } from '@angular/core';
import { TestTree } from '../../components/test-tree/test-tree';
import { TestDistributionPie } from '../../components/test-distribution-pie/test-distribution-pie';
import { TestReport } from '../../types/TestReport';
import { TreeOrganizationStrategy } from '../../components/test-tree/strategies/tree-organization-strategy.interface';
import { LARGE_TEST_DATA } from './test-data';
import { DistributionStrategy } from '../../components/test-distribution-pie/strategies/distribution-strategy.interface';
import { TreeOrganizationStrategyFactory } from '../../components/test-tree/strategies/tree-organization-strategy.factory';
import { DistributionStrategyFactory } from '../../components/test-distribution-pie/strategies/distribution-strategy.factory';

@Component({
  selector: 'app-home',
  imports: [TestTree, TestDistributionPie],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  testReport = signal<TestReport>(LARGE_TEST_DATA);

  summaryOrganizationStrategy = signal<DistributionStrategy>(
    DistributionStrategyFactory.create('status'),
  );
  treeOrganizationStrategy = signal<TreeOrganizationStrategy>(
    TreeOrganizationStrategyFactory.create('folder'),
  );
}
