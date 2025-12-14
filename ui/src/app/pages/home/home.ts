import { Component, signal } from '@angular/core';
import { TestTree } from '../../components/test-tree/test-tree';
import { TestDistributionPie } from '../../components/test-distribution-pie/test-distribution-pie';
import { TestReport } from '../../types/TestReport';
import { TreeOrganizationStrategy } from '../../components/test-tree/strategies/tree-organization-strategy.interface';
import { FolderOrganizationStrategy } from '../../components/test-tree/strategies/folder-organization.strategy';
import { LARGE_TEST_DATA } from './test-data';

@Component({
  selector: 'app-home',
  imports: [TestTree, TestDistributionPie],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  testReport = signal<TestReport>(LARGE_TEST_DATA);

  strategy = signal<TreeOrganizationStrategy>(new FolderOrganizationStrategy());
}
