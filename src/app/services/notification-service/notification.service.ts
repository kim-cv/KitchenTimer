import { Injectable } from '@angular/core';
import { Plugins, LocalNotificationPendingList, LocalNotificationActionPerformed, LocalNotification } from '@capacitor/core';
import { Timer } from 'src/app/models/timer/Timer';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  public onlocalNotificationReceived: Subject<LocalNotification> = new Subject();
  public onLocalNotificationActionPerformed: Subject<LocalNotificationActionPerformed> = new Subject();

  constructor() {
    this.InitNotificationListeners();
  }

  private InitNotificationListeners() {
    Plugins.LocalNotifications.addListener('localNotificationReceived', (notification) => {
      console.log('localNotificationReceived', notification);
      this.onlocalNotificationReceived.next(notification);
    });

    Plugins.LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      this.onLocalNotificationActionPerformed.next(notification);
    });
  }

  public RetrievePendingNotifications() {
    return Plugins.LocalNotifications.getPending();
  }

  public async Schedule(timer: Timer) {
    const futureDate = new Date();
    futureDate.setSeconds(futureDate.getSeconds() + timer.remainingSeconds);

    await Plugins.LocalNotifications.schedule({
      notifications: [{
        title: 'Timer completed',
        body: timer.name.concat(' has finished!'),
        id: timer.id,
        sound: null,
        attachments: null,
        schedule: {
          at: futureDate
        },
        actionTypeId: null,
        extra: {
        }
      }]
    });
  }

  public async Cancel(timer: Timer) {
    const pendingNotifications = await this.RetrievePendingNotifications();
    const foundNotifications = pendingNotifications.notifications.filter(tmpPendingNotification => Number(tmpPendingNotification.id) === timer.id);

    const mapToLocalNotificationPendingList: LocalNotificationPendingList = {
      notifications: foundNotifications
    };

    await Plugins.LocalNotifications.cancel(mapToLocalNotificationPendingList);
  }
}
