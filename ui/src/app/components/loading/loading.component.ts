import { Component, input } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-loading',
  imports: [MatProgressBarModule],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.css',
})
export class LoadingComponent {
  message = input.required<string>();
}
