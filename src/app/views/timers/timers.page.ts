import { Component } from '@angular/core';
import { Timer } from '../../models/timer/Timer';
import { ActionSheetController } from '@ionic/angular';
import { TimerService } from '../../services/timer-service/timer.service';
import { Router } from '@angular/router';
import { TimerStatus } from 'src/app/models/timer/ENUM_TimerStatus';

@Component({
  selector: 'app-timers',
  templateUrl: 'timers.page.html',
  styleUrls: ['timers.page.scss']
})
export class TimersPage {

  public timerStatus = TimerStatus;

  constructor(private router: Router, private actionSheetCtrl: ActionSheetController, public timerService: TimerService) { }

  private OnAddTimer() {
    this.router.navigate(['/AddTimer']);
  }

  private OnPlay(timer: Timer) {
    this.timerService.StartTimer(timer.id);
  }

  private OnPause(timer: Timer) {
    this.timerService.PauseTimer(timer.id);
  }

  private OnReset(timer: Timer) {
    this.timerService.ResetTimer(timer.id);
  }

  private async OnEdit(timer: Timer) {
    const tmpActionSheet = await this.actionSheetCtrl.create({
      header: 'Options',
      buttons: [
        {
          text: 'Remove Timer',
          icon: 'trash',
          role: 'destructive',
          handler: () => {
            this.timerService.DeleteTimer(timer.id);
          }
        },
        {
          text: 'Edit Timer',
          icon: 'build',
          handler: () => {
            this.router.navigate(['/AddTimer'], { queryParams: { timerId: timer.id } });
          }
        },
        {
          text: 'Close Menu',
          icon: 'arrow-back',
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    });

    // Show action sheet
    await tmpActionSheet.present();
  }

  // #region HTML Methods
  public HTMLOnAddTimer($event) {
    this.OnAddTimer();
  }

  public HTMLOnPlay(timer: Timer, $event) {
    this.OnPlay(timer);
  }

  public HTMLOnPause(timer: Timer, $event) {
    this.OnPause(timer);
  }

  public HTMLOnReset(timer: Timer, $event) {
    this.OnReset(timer);
  }

  public HTMLOnEdit(timer: Timer, $event) {
    this.OnEdit(timer);
  }
  // #endregion
}
