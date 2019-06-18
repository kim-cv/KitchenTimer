import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { TimerService } from './services/timer-service/timer.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private timerProvider: TimerService
  ) {
    this.initializeApp();
  }

  // Starting app
  initializeApp() {
    this.platform
      .ready()
      .then(() => {
        console.log('App ready');

        this.statusBar.styleDefault();
        this.splashScreen.hide();

        this.timerProvider.LoadTimers();
      });

    this.platform.pause
      .subscribe(() => {
        console.log('app paused');
        this.timerProvider.SaveTimersToStorage();
      });

    // Resumed from background
    this.platform
      .resume
      .subscribe(
        () => {
          console.log('App resumed 2');
        });
  }
}
