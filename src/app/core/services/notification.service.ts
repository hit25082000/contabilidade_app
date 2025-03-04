import { Injectable, PLATFORM_ID, Inject, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SwPush } from '@angular/service-worker';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, retry, throwError, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationMessage } from '../models/notification-message';
import { timer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private swPush = inject(SwPush);
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  readonly VAPID_PUBLIC_KEY = environment.PUBLIC_VAPID_KEY;
  private baseUrl = environment.PUSH_NOTIFICATIONS_URL;
    
  private get headers(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${environment.SUPABASE_FUNCTIONS_TOKEN}`,
      'apikey': environment.SUPABASE_ANON_KEY,
    });
  }

  constructor() {    
    this.subscribeToNotifications();
    this.setupNotificationListener();
  }

  async getSubscription(): Promise<PushSubscription | null> {
    
    if (!this.swPush.isEnabled) {
      return null;
    }

    try {
      // Tenta obter a subscrição existente
      let subscription = await this.swPush.subscription.toPromise();

      // Se não existe subscrição, tenta criar uma nova
      if (!subscription) {
        subscription = await this.swPush.requestSubscription({
          serverPublicKey: this.VAPID_PUBLIC_KEY
        });
      }

      return subscription;
    } catch (error) {
      return null;
    }
  }

  subscribeToNotifications() {
    
    if (!this.swPush.isEnabled) {
      return;
    }

    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    })
    .then(subscription => {
      this.sendSubscriptionToServer(subscription)
        .subscribe({
          next: (response) => console.log('[NotificationService] Inscrição registrada no servidor:', response),
          error: (error) => console.error('[NotificationService] Erro ao registrar inscrição:', error)
        });
    })
    .catch(error => console.error('[NotificationService] Erro ao se inscrever nas notificações:', error));
  }

  requestPermission(): Promise<NotificationPermission> {
    
    if (!this.notificationSupported) {
      return Promise.reject('Notifications not supported');
    }
    return window.Notification.requestPermission()
      .then(permission => {
        return permission;
      });
  }

  showNotification(title: string, options?: NotificationOptions): void {
    
    if (!this.notificationSupported) {
      return;
    }

    if (window.Notification.permission === 'granted') {
      new window.Notification(title, options);
    } else {
    }
  }

  isNotificationSupported(): boolean {
    const supported = this.notificationSupported;
    return supported;
  }

  getCurrentPermission(): NotificationPermission | null {
    if (!this.notificationSupported) {
      return null;
    }
    const permission = window.Notification.permission;
    return permission;
  }

  private get notificationSupported(): boolean {
    return isPlatformBrowser(this.platformId) && 'Notification' in window;
  }

  private sendSubscriptionToServer(subscription: PushSubscription): Observable<NotificationMessage> {    

    return this.http.post<NotificationMessage>(
      this.baseUrl,
      subscription,
      {
        headers: this.headers,
        withCredentials: false,
        observe: 'response'
      }
    ).pipe(
      tap(response => {
     
      }),
      map(response => response.body as NotificationMessage),
      retry({
        count: 3,
        delay: (error, retryCount) => {
          console.log(`[NotificationService] Tentativa ${retryCount} de 3`);
          return timer(1000 * retryCount);
        }
      }),
      catchError(error => {
      
        return throwError(() => error);
      })
    );
  }

  setupNotificationListener() {    
    this.swPush.notificationClicks.subscribe(({ action, notification }) => {
      
      if (notification.data?.url) {
        window.location.href = notification.data.url;
      }
    });
  }
}