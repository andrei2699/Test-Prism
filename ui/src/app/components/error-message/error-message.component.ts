import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [MatIconModule, MatCardModule],
  templateUrl: './error-message.component.html',
  styleUrl: './error-message.component.css',
})
export class ErrorMessageComponent {
  title = input.required<string>();
  message = input.required<string>();
  hint = input.required<string | null>();
}
