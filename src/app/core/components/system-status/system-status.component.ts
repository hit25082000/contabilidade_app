import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConnectivityService } from '../../services/connectivity.service';
import { UpdateService } from '../../services/update.service';
import { LoadingService } from '../../services/loading.service';
import { NotificationService } from '../../services/notification.service';
import { UserService } from '../../../features/services/user.service';
import { CacheInspectorService } from '../../services/cache-inspector.service';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-system-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="system-status-container">
      <h2>Status do Sistema</h2>

      <!-- Status de Conectividade -->
      <section class="status-section">
        <h3>Conectividade</h3>
        <p [class.online]="isOnline()" [class.offline]="!isOnline()">
          Status: {{ isOnline() ? 'Online' : 'Offline' }}
        </p>
      </section>

      <!-- Status do Service Worker -->
      <section class="status-section">
        <h3>Atualizações</h3>
        <button (click)="checkForUpdates()" [disabled]="loading()">
          Verificar Atualizações
        </button>
      </section>

      <!-- Notificações -->
      <section class="status-section">
        <h3>Notificações Push</h3>
        <p>Status: {{ notificationStatusText() }}</p>
        <button (click)="requestNotificationPermission()" [disabled]="loading()">
          Solicitar Permissão
        </button>
        <button (click)="testNotification()" [disabled]="!isNotificationEnabled() || loading()">
          Testar Notificação
        </button>
      </section>

      <!-- Teste Integrado Supabase Functions + Push Notifications -->
      <section class="status-section">
        <h3>Teste Integrado: Supabase Functions + Push Notifications</h3>
        <p>Status: {{ pushNotificationStatus() }}</p>
        <button 
          (click)="testSupabasePushNotification()" 
          [disabled]="!isNotificationEnabled() || loading()">
          Enviar Notificação via Supabase
        </button>
      </section>

      <!-- Cache -->
      <section class="status-section">
        <h3>Cache de Assets</h3>
        <button (click)="inspectCache()" [disabled]="loading()">
          Inspecionar Cache
        </button>
        <ul *ngIf="getCachedAssets().length">
          <li *ngFor="let asset of getCachedAssets()">{{ asset.path }}</li>
        </ul>
      </section>

      <!-- Teste Supabase -->
      <section class="status-section">
        <h3>Supabase</h3>
        <button (click)="loadUsers()" [disabled]="loading()">
          Carregar Usuários
        </button>
        <div *ngIf="users().length" class="users-list">
          <p>Total de usuários: {{ users().length }}</p>
          <ul>
            <li *ngFor="let user of users()">
              {{ user.id }}
            </li>
          </ul>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .system-status-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .status-section {
      margin-bottom: 20px;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }

    .online {
      color: green;
    }

    .offline {
      color: red;
    }

    button {
      padding: 8px 16px;
      margin: 5px;
      border-radius: 4px;
      border: 1px solid #ccc;
      background-color: #fff;
      cursor: pointer;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .users-list {
      margin-top: 10px;
    }

    ul {
      list-style: none;
      padding: 0;
    }

    li {
      padding: 5px 0;
    }
  `],
  providers: [UserService]
})
export class SystemStatusComponent implements OnInit {
  private connectivityService = inject(ConnectivityService);
  private updateService = inject(UpdateService);
  private loadingService = inject(LoadingService);
  private notificationService = inject(NotificationService);
  private userService = inject(UserService);
  private cacheInspector = inject(CacheInspectorService);

  // Signals privados
  #loading = signal(false);
  #notificationStatus = signal('Não verificado');
  #canSendNotification = signal(false);
  #cachedAssets = signal<Array<{ path: string }>>([]);
  #pushNotificationStatus = signal('Aguardando teste...');

  // Getters públicos
  isOnline = this.connectivityService.isOnline;
  users = this.userService.users;
  loading = computed(() => this.#loading());
  notificationStatusText = computed(() => this.#notificationStatus());
  isNotificationEnabled = computed(() => this.#canSendNotification());
  getCachedAssets = computed(() => this.#cachedAssets());
  pushNotificationStatus = computed(() => this.#pushNotificationStatus());

  ngOnInit() {
    this.checkNotificationStatus();
  }

  async checkForUpdates() {
    if (this.#loading()) return;
    
    this.#loading.set(true);
    try {
      const hasUpdate = await this.updateService.checkForUpdate();
      if (hasUpdate) {
        ('Nova versão disponível');
      } else {
        ('Sistema atualizado');
      }
    } finally {
      this.#loading.set(false);
    }
  }

  async requestNotificationPermission() {
    if (this.#loading()) return;

    this.#loading.set(true);
    try {
      const permission = await this.notificationService.requestPermission();
      this.#notificationStatus.set(`Permissão: ${permission}`);
      this.#canSendNotification.set(permission === 'granted');
    } catch (error) {
      this.#notificationStatus.set('Não suportado');
      this.#canSendNotification.set(false);
    } finally {
      this.#loading.set(false);
    }
  }

  testNotification() {
    if (!this.#canSendNotification()) return;

    this.notificationService.showNotification('Teste de Notificação', {
      body: 'Esta é uma notificação de teste do sistema',
      icon: '/assets/icons/icon-128x128.png'
    });
  }

  async inspectCache() {
    if (this.#loading()) return;

    this.#loading.set(true);
    try {
      const assets = await this.cacheInspector.checkAssetsCache();
      this.#cachedAssets.set(assets);
    } finally {
      this.#loading.set(false);
    }
  }

  loadUsers() {
    if (this.#loading()) return;

    this.#loading.set(true);
    try {
      this.userService.reloadUsers();
    } finally {
      this.#loading.set(false);
    }
  }

  private checkNotificationStatus() {
    const permission = this.notificationService.getCurrentPermission();
    if (permission === null) {
      this.#notificationStatus.set('Não suportado');
      return;
    }
    this.#notificationStatus.set(`Permissão: ${permission}`);
    this.#canSendNotification.set(permission === 'granted');
  }

  async testSupabasePushNotification() {
    if (this.#loading() || !this.#canSendNotification()) return;

    this.#loading.set(true);
    this.#pushNotificationStatus.set('Enviando notificação...');

    try {
      const subscription = await this.notificationService.getSubscription();
      
      if (!subscription) {
        this.#pushNotificationStatus.set('Erro: Subscrição não encontrada');
        return;
      }

      const response = await fetch(`${environment.SUPABASE_URL}/functions/v1/push-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${environment.SUPABASE_FUNCTIONS_TOKEN}`,
          'apikey': environment.SUPABASE_ANON_KEY,
          'origin': window.location.origin
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify(subscription)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      this.#pushNotificationStatus.set('Notificação enviada com sucesso!');
      ('[SystemStatus] Resposta do servidor:', result);
    } catch (error) {
      console.error('[SystemStatus] Erro ao enviar notificação:', error);
      this.#pushNotificationStatus.set(`Erro: ${error}`);
    } finally {
      this.#loading.set(false);
    }
  }
} 