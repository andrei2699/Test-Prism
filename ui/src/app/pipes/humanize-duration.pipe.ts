import { Pipe, PipeTransform } from '@angular/core';
import humanizeDuration from 'humanize-duration';

@Pipe({
  name: 'humanizeDuration',
  standalone: true,
})
export class HumanizeDurationPipe implements PipeTransform {
  transform(milliseconds: number): string {
    if (!milliseconds || milliseconds < 0) {
      return '0ms';
    }

    return humanizeDuration(milliseconds, {
      round: false,
      units: ['h', 'm', 's', 'ms'],
      largest: 2,
    });
  }
}
