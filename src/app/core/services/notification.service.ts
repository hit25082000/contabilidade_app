import { Injectable, PLATFORM_ID, Inject, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SwPush } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationMessage } from '../models/notification-message';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private swPush = inject(SwPush);
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  readonly VAPID_PUBLIC_KEY = environment.PUBLIC_VAPID_KEY;
  private baseUrl = 'http://localhost:3000';

  constructor(
  ) {
    this.subscribeToNotifications();
  }

  subscribeToNotifications() {
    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    })
    .then(subscription => {
      this.sendSubscriptionToServer(subscription)
        .subscribe();
    })
    .catch(error => console.error('Erro ao se inscrever:', error));
  }


  requestPermission(): Promise<NotificationPermission> {
    if (!this.notificationSupported) {
      return Promise.reject('Notifications not supported');
    }
    return window.Notification.requestPermission();
  }

  showNotification(title: string, options?: NotificationOptions): void {
    if (!this.notificationSupported) {
      console.warn('Notifications not supported');
      return;
    }

    if (window.Notification.permission === 'granted') {
      new window.Notification(title, options);
    } else {
      console.warn('Notification permission not granted');
    }
  }

  isNotificationSupported(): boolean {
    return this.notificationSupported;
  }

  getCurrentPermission(): NotificationPermission | null {
    if (!this.notificationSupported) {
      return null;
    }
    return window.Notification.permission;
  }

  private get notificationSupported(): boolean {
    return isPlatformBrowser(this.platformId) && 'Notification' in window;
  }

  private sendSubscriptionToServer(subscription: PushSubscription): Observable<NotificationMessage> {
    return this.http.post<NotificationMessage>(
      `${this.baseUrl}/subscribe`,
      subscription
    );
  }
}