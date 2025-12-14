import { Component, signal } from '@angular/core';
import { TestTree } from '../../components/test-tree/test-tree';
import { TestReport } from '../../types/TestReport';

@Component({
  selector: 'app-home',
  imports: [TestTree],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  testReport = signal<TestReport>({
    version: 1,
    date: new Date(),
    tests: [
      {
        lastExecutionType: 'SUCCESS',
        name: 'Test 1',
        path: '/folder/test1',
      },
    ],
  });
}
