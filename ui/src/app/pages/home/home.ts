import { Component, inject } from '@angular/core';
import { LoadingComponent } from '../../components/loading/loading.component';
import { ErrorMessageComponent } from '../../components/error-message/error-message.component';
import { TestDataService } from '../../services/test-data.service';
import { PageRenderer } from '../../components/renderers/page-renderer/page-renderer';
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [LoadingComponent, ErrorMessageComponent, PageRenderer],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private testDataService = inject(TestDataService);
  private layoutService = inject(LayoutService);

  testData = this.testDataService.testData;
  layout = this.layoutService.layout;
}
