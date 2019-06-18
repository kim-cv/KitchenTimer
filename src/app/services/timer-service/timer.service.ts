import { Injectable } from '@angular/core';
import { Timer } from 'src/app/models/timer/Timer';
import { FilesystemService } from '../filesystem-service/filesystem.service';
import { NotificationService } from '../notification-service/notification.service';
import { IOldTimer } from 'src/app/models/timer/IOldTimer';
import { timer } from 'rxjs';
import { TimerStatus } from 'src/app/models/timer/ENUM_TimerStatus';


@Injectable({
  providedIn: 'root'
})
export class TimerService {

  public timers: Timer[] = [];

  constructor(private fileSystemService: FilesystemService, private notificationService: NotificationService) {
    // this.RetrieveTimersFromOldStorage();
    // this.AddTimerToList(this.CreateTimer('Test Timer1', false, 50));
    // this.AddTimerToList(this.CreateTimer('Test Timer2', false, 5));

    timer(1000, 1000).subscribe(() => {
      const countingTimers = this.timers.filter(tmpTimer => tmpTimer.state === TimerStatus.COUNTING);
      countingTimers.forEach(tmpTimer => { tmpTimer.Count(); if (tmpTimer.remainingSeconds <= 0) { this.SortArray(); } });
    });

    this.notificationService
      .onLocalNotificationActionPerformed
      .subscribe((notification) => {

      });
  }

  private SortArray() {
    // Return -1 = sort a to an index lower than b, i.e. a comes first.
    // Return 0 = leave a and b unchanged with respect to each other, but sorted with respect to all different elements.
    // Return 1 = sort b to an index lower than a, i.e. b comes first.

    this.timers.sort((a: Timer, b: Timer) => {
      if (a.state === TimerStatus.DONE && b.state !== TimerStatus.DONE) {
        return -1;
      }
      if (a.state !== TimerStatus.DONE && b.state === TimerStatus.DONE) {
        return 1;
      }

      if (a.state === TimerStatus.COUNTING && b.state !== TimerStatus.COUNTING) {
        return -1;
      }

      if (a.state !== TimerStatus.COUNTING && b.state === TimerStatus.COUNTING) {
        return 1;
      }

      return 0;
    });
  }

  public AddTimerToList(tmpTimer: Timer) {
    this.timers.push(tmpTimer);
  }

  public GetTimerOnId(id: number): Timer {
    return this.timers.find(tmpTimer => {
      return (tmpTimer.id === id);
    });
  }


  // #region Loading & Saving
  /**
   * @description Load timers from storage and add them to the list
   */
  public async LoadTimers(): Promise<void> {
    const timers = await this.fileSystemService.LoadTimers();

    timers.forEach(tmpTimerData => {
      const tmpTimer = this.CreateTimer(tmpTimerData.name, true, tmpTimerData.timerLengthInSeconds, tmpTimerData.id);

      if (
        tmpTimerData.state === TimerStatus.COUNTING &&
        typeof tmpTimerData.startTime !== 'undefined' &&
        tmpTimerData.startTime !== null
      ) {
        tmpTimer.Resume(new Date(tmpTimerData.startTime));
        tmpTimer.state = tmpTimerData.state;
      } else {
        tmpTimer.Reset();
      }

      this.AddTimerToList(tmpTimer);
    });
  }

  /**
   * @description Save timers to storage
   */
  public async SaveTimersToStorage() {
    // Only save timers where saveTimer is true
    const tmpTimers = this.timers.filter(tmpTimer => tmpTimer.saveTimer === true);
    await this.fileSystemService.SaveTimers(tmpTimers);
  }
  // #endregion


  // #region CRUD
  public CreateTimer(name: string, saveTimer: boolean, timerLengthInSeconds: number, id?: number): Timer {
    const uid = id ? id : Math.floor(Math.random() * 100000);
    const tmpTimer = new Timer(saveTimer, uid, name, timerLengthInSeconds);
    return tmpTimer;
  }

  public UpdateTimer(id: number, name: string, lengthInSeconds: number, saveTimer: boolean) {
    const tmpTimer = this.GetTimerOnId(id);
    tmpTimer.Update(name, lengthInSeconds, saveTimer);
  }

  public DeleteTimer(id: number): void {
    const timer = this.GetTimerOnId(id);

    if (typeof timer === 'undefined' || timer === null) {
      // Could not find timer
      return;
    }

    const index = this.timers.findIndex(tmpTimer => tmpTimer.id === id);
    if (index < 0) {
      // Could not get the index
      return;
    }

    this.timers.splice(index, 1);
  }
  // #endregion


  // #region Start / Pause / Reset - Timer
  public StartTimer(id: number): void {
    const tmpTimer = this.GetTimerOnId(id);
    if (typeof tmpTimer !== 'undefined' && tmpTimer !== null) {
      tmpTimer.Start();
      this.notificationService.Schedule(tmpTimer);
      this.SortArray();
    }
  }

  public PauseTimer(id: number): void {
    const tmpTimer = this.GetTimerOnId(id);
    if (typeof tmpTimer !== 'undefined' && tmpTimer !== null) {
      tmpTimer.Pause();
      this.notificationService.Cancel(tmpTimer);
      this.SortArray();
    }
  }

  public ResetTimer(id: number): void {
    const tmpTimer = this.GetTimerOnId(id);
    if (typeof tmpTimer !== 'undefined' && tmpTimer !== null) {
      tmpTimer.Reset();
      this.notificationService.Cancel(tmpTimer);
      this.SortArray();
    }
  }
  // #endregion


  // #region Old timers
  /**
   * @description Retrieves timers from old storage and converts them to new timers and adds them to the timer list
   */
  private async RetrieveTimersFromOldStorage() {
    const oldUnknownTimers = await this.fileSystemService.RetrieveTimersFromOldStorage();
    const oldTimers = this.FilterToValidOldTimers(oldUnknownTimers);
    const oldTimersMappedToNewTimers = this.MapOldTimersToNewTimers(oldTimers);
    oldTimersMappedToNewTimers.forEach(tmpTimer => this.AddTimerToList(tmpTimer));
  }

  /**
   * @description Maps old timer data to new timer data
   */
  private MapOldTimersToNewTimers(oldTimers: IOldTimer[]): Timer[] {
    return oldTimers.map(element => {
      const tmpTimerData = {
        name: (element.title ? element.title : 'Unknown Title'),
        timerLengthInSeconds: (element.length ? element.length : 0)
      };

      return this.CreateTimer(tmpTimerData.name, true, tmpTimerData.timerLengthInSeconds);
    });
  }

  /**
   * @description Returns old timers that matches old timer data contract
   */
  private FilterToValidOldTimers(tmpJsonObjects: unknown[]) {
    return tmpJsonObjects.filter(element => this.isOldTimer(element)) as IOldTimer[];
  }

  /**
   * @description Typeguard to verify the data corrosponds to our old timer interface contract
   */
  private isOldTimer(value: any): value is IOldTimer {
    /**
     * title required and must be string and atleast have a length of 1
     * length required and must be number and larger than 0
     * id is NOT required so it can be undefined or null but IF it's present it must be string
     */
    return typeof value === 'object' &&
      'title' in value && typeof value.title === 'string' && value.title.length >= 1 &&
      'length' in value && typeof value.length === 'number' && value.length >= 0 &&
      (
        (typeof value.id === 'undefined' || value.id === null) ||
        ('id' in value && typeof value.id === 'string')
      );
  }
  // #endregion
}
