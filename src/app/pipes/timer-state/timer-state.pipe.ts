import { Pipe, PipeTransform } from '@angular/core';
import { Timer } from 'src/app/models/timer/Timer';
import { TimerStatus } from 'src/app/models/timer/ENUM_TimerStatus';

@Pipe({
  name: 'timerStatePipe',
  pure: true
})
export class TimerStatePipe implements PipeTransform {
  transform(items: Timer[], status: TimerStatus[]): Timer[] {
    return items.filter(tmpTimer => {
      return status.some(tmpStatus => tmpStatus === tmpTimer.state);
    });
  }
}
