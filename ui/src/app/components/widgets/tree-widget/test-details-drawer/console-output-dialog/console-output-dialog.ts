import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConsoleOutputDialogData {
  timestamp: string;
  consoleOutput: string;
}

@Component({
  selector: 'app-console-output-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: 'console-output-dialog.html',
  styleUrl: './console-output-dialog.css',
})
export class ConsoleOutputDialog {
  data = inject<ConsoleOutputDialogData>(MAT_DIALOG_DATA);
}
