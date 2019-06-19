import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Timer } from 'src/app/models/timer/Timer';
import { AlertController } from '@ionic/angular';
import { TimerService } from 'src/app/services/timer-service/timer.service';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors, FormControl } from '@angular/forms';

enum OPERATION_STATE {
  ADD_TIMER,
  CHANGE_TIMER
}

@Component({
  selector: 'app-add-timer',
  templateUrl: './add-timer.component.html',
  styleUrls: ['./add-timer.component.scss'],
})
export class AddTimerComponent implements OnInit {

  // Formgroup
  public formgroupAddTimer: FormGroup;

  public timer: Timer = undefined;

  private operation_state: OPERATION_STATE = undefined;

  ngOnInit(): void {
    // Wait for data from query params
    this.route
      .queryParamMap
      .pipe(
        map(params => params.get('timerId') || null)
      )
      .subscribe(
        (result) => {
          if (result !== null) {
            this.Initialize(Number(result));
          } else {
            this.Initialize(null);
          }
        });
  }

  constructor(
    private location: Location,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private timerProvider: TimerService,
    private alertCtrl: AlertController) {

    // Make formgroup
    this.formgroupAddTimer = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(30), this.validator_preventOnlySpaces(1)]],
      hours: ['', [Validators.required]],
      minutes: ['', [Validators.required]],
      seconds: ['', [Validators.required]],
      type: ['', [Validators.required]]
    });
  }

  private Initialize(timerId: number | null) {
    const tmpDate = new Date();
    tmpDate.setHours(0);
    tmpDate.setMinutes(0);
    tmpDate.setSeconds(0);

    if (typeof timerId !== 'undefined' && timerId === null) {
      // Creating new timer, Set operation state
      this.operation_state = OPERATION_STATE.ADD_TIMER;

    } else if (typeof timerId !== 'undefined' && typeof timerId === 'number') {
      // Editing timer

      // Set operation state
      this.operation_state = OPERATION_STATE.CHANGE_TIMER;

      const tmpTimer = this.timerProvider.GetTimerOnId(timerId);

      // Could not find timer on id
      if (typeof tmpTimer === 'undefined' || tmpTimer === null) {
        this.ShowError();
        return;
      }

      // Got timer
      this.timer = tmpTimer;

      // Set formgroup timer name
      this.formgroupAddTimer.get('name').setValue(this.timer.name);
      // Set formgroup save type
      this.formgroupAddTimer.get('type').setValue(this.timer.saveTimer.toString());

      // Set date seconds
      tmpDate.setSeconds(tmpTimer.timerLengthInSeconds);
    }

    // Set datetime in formgroup
    this.formgroupAddTimer.get('hours').setValue(tmpDate.toISOString());
    this.formgroupAddTimer.get('minutes').setValue(tmpDate.toISOString());
    this.formgroupAddTimer.get('seconds').setValue(tmpDate.toISOString());
  }

  private FormatToLeadingZero(num: number): string {
    return ((num < 10 ? '0' : '') + num).toString();
  }

  private async ShowError() {
    const alert = await this.alertCtrl.create({
      header: '😭',
      subHeader: 'Could not find the timer you want to edit.\nSorry.',
      buttons: [{
        text: 'Okay',
        handler: (data) => {
          this.GoToPreviousPage();
        }
      }]
    });
    await alert.present();
  }

  private Save(name: string, hours: number, minutes: number, seconds: number, type: boolean) {
    const totalTimeInSeconds = (hours * 60 * 60) + (minutes * 60) + seconds;

    if (this.operation_state === OPERATION_STATE.ADD_TIMER) {
      const newTimer = this.timerProvider.CreateTimer(name, type, totalTimeInSeconds);
      this.timerProvider.AddTimerToList(newTimer);
    } else if (this.operation_state === OPERATION_STATE.CHANGE_TIMER) {
      this.timerProvider.UpdateTimer(this.timer.id, name, totalTimeInSeconds, type);
    }
  }

  private GoToPreviousPage() {
    this.location.back();
  }

  // #region HTML Methods
  public async HTMLOnSave($event) {
    this.formgroupAddTimer.disable();

    // Force re-validate on submit
    Object.keys(this.formgroupAddTimer.controls).forEach(field => {
      const control = this.formgroupAddTimer.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
        control.markAsDirty({ onlySelf: true });
        control.updateValueAndValidity();
      }
    });

    if (this.formgroupAddTimer.invalid) {
      this.formgroupAddTimer.enable();
      return;
    }

    const name: string = this.formgroupAddTimer.get('name').value.trim();

    const hoursTrimmed: string = this.formgroupAddTimer.get('hours').value.trim();
    const minutesTrimmed: string = this.formgroupAddTimer.get('minutes').value.trim();
    const secondsTrimmed: string = this.formgroupAddTimer.get('seconds').value.trim();

    const hours: number = new Date(hoursTrimmed).getHours();
    const minutes: number = new Date(minutesTrimmed).getMinutes();
    const seconds: number = new Date(secondsTrimmed).getSeconds();

    const typeTrimmed: string = this.formgroupAddTimer.get('type').value.trim();
    const type: boolean = (typeTrimmed === 'true') ? true : false;

    try {
      this.Save(name, hours, minutes, seconds, type);
      this.formgroupAddTimer.reset();
    } catch (err) {
      console.error('HTMLOnSave()', err);
    }

    this.formgroupAddTimer.enable();
    this.GoToPreviousPage();
  }

  public HTMLOnCancel($event) {
    this.GoToPreviousPage();
  }
  // #endregion

  // #region Utils
  /**
   * @description Prevents formcontrol from only containing whitespaces
   */
  private validator_preventOnlySpaces(requiredLengthWithoutSpaces: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value: string = control.value;

      if (typeof value === 'undefined' || value === null) {
        return { required: { value: value } };
      }

      // Trim both ends
      const trimmedString = value.trim();

      if (trimmedString.length < requiredLengthWithoutSpaces) {
        return { minlength: { value: value } };
      }

      return null;
    };
  }
  // #endregion
}
