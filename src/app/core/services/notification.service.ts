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
  private baseUrl = `${environment.SUPABASE_URL_HOM}/functions/v1/push-notification`;

  private get headers(): HttpHeaders {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${environment.SUPABASE_FUNCTIONS_TOKEN}`,
      'apikey': environment.SUPABASE_ANON_KEY
    });
    console.log('[NotificationService] Headers configurados:', headers);
    return headers;
  }

  constructor() {
    console.log('[NotificationService] Inicializando serviço...');
    console.log('[NotificationService] Service Worker habilitado:', this.swPush.isEnabled);
    console.log('[NotificationService] VAPID_PUBLIC_KEY:', this.VAPID_PUBLIC_KEY);
    console.log('[NotificationService] Base URL:', this.baseUrl);
    
    this.subscribeToNotifications();
    this.setupNotificationListener();
  }

  async getSubscription(): Promise<PushSubscription | null> {
    console.log('[NotificationService] Tentando obter subscrição...');
    
    if (!this.swPush.isEnabled) {
      console.warn('[NotificationService] Push notifications não estão habilitadas');
      return null;
    }

    try {
      // Tenta obter a subscrição existente
      let subscription = await this.swPush.subscription.toPromise();
      console.log('[NotificationService] Subscrição existente:', subscription);

      // Se não existe subscrição, tenta criar uma nova
      if (!subscription) {
        console.log('[NotificationService] Subscrição não encontrada, criando nova...');
        subscription = await this.swPush.requestSubscription({
          serverPublicKey: this.VAPID_PUBLIC_KEY
        });
        console.log('[NotificationService] Nova subscrição criada:', subscription);
      }

      return subscription;
    } catch (error) {
      console.error('[NotificationService] Erro ao obter/criar subscrição:', error);
      return null;
    }
  }

  subscribeToNotifications() {
    console.log('[NotificationService] Iniciando processo de subscrição...');
    
    if (!this.swPush.isEnabled) {
      console.warn('[NotificationService] Notificações push não estão habilitadas');
      return;
    }

    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    })
    .then(subscription => {
      console.log('[NotificationService] Inscrição bem-sucedida:', subscription);
      this.sendSubscriptionToServer(subscription)
        .subscribe({
          next: (response) => console.log('[NotificationService] Inscrição registrada no servidor:', response),
          error: (error) => console.error('[NotificationService] Erro ao registrar inscrição:', error)
        });
    })
    .catch(error => console.error('[NotificationService] Erro ao se inscrever nas notificações:', error));
  }

  requestPermission(): Promise<NotificationPermission> {
    console.log('[NotificationService] Solicitando permissão de notificação...');
    
    if (!this.notificationSupported) {
      console.error('[NotificationService] Notificações não são suportadas');
      return Promise.reject('Notifications not supported');
    }
    return window.Notification.requestPermission()
      .then(permission => {
        console.log('[NotificationService] Permissão de notificação:', permission);
        return permission;
      });
  }

  showNotification(title: string, options?: NotificationOptions): void {
    console.log('[NotificationService] Tentando mostrar notificação:', { title, options });
    
    if (!this.notificationSupported) {
      console.warn('[NotificationService] Notificações não são suportadas');
      return;
    }

    if (window.Notification.permission === 'granted') {
      new window.Notification(title, options);
      console.log('[NotificationService] Notificação exibida com sucesso');
    } else {
      console.warn('[NotificationService] Permissão de notificação não concedida');
    }
  }

  isNotificationSupported(): boolean {
    const supported = this.notificationSupported;
    console.log('[NotificationService] Suporte a notificações:', supported);
    return supported;
  }

  getCurrentPermission(): NotificationPermission | null {
    if (!this.notificationSupported) {
      console.warn('[NotificationService] Notificações não são suportadas');
      return null;
    }
    const permission = window.Notification.permission;
    console.log('[NotificationService] Permissão atual:', permission);
    return permission;
  }

  private get notificationSupported(): boolean {
    return isPlatformBrowser(this.platformId) && 'Notification' in window;
  }

  private sendSubscriptionToServer(subscription: PushSubscription): Observable<NotificationMessage> {
    console.log('[NotificationService] Enviando subscrição para o servidor:', {
      url: this.baseUrl,
      subscription,
      headers: this.headers
    });

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
        console.log('[NotificationService] Headers da resposta:', response.headers);
        console.log('[NotificationService] Status da resposta:', response.status);
        console.log('[NotificationService] Corpo da resposta:', response.body);
      }),
      map(response => response.body as NotificationMessage),
      retry({
        count: 3,
        delay: (error, retryCount) => {
          console.log(`[NotificationService] Tentativa ${retryCount} de 3`);
          return timer(1000 * retryCount); // Espera progressiva: 1s, 2s, 3s
        }
      }),
      catchError(error => {
        console.error('[NotificationService] Erro ao enviar subscrição:', {
          error,
          status: error.status,
          message: error.message,
          response: error.error,
          headers: error.headers?.keys().map((key:any) => `${key}: ${error.headers?.get(key)}`)
        });
        return throwError(() => error);
      })
    );
  }

  setupNotificationListener() {
    console.log('[NotificationService] Configurando listener de notificações...');
    
    this.swPush.notificationClicks.subscribe(({ action, notification }) => {
      console.log('[NotificationService] Notificação clicada:', {
        action,
        notification,
        data: notification.data
      });
      
      if (notification.data?.url) {
        console.log('[NotificationService] Redirecionando para:', notification.data.url);
        window.location.href = notification.data.url;
      }
    });
  }
}