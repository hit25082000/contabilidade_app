import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConnectivityService } from './core/services/connectivity.service';
import { NotificationService } from './core/services/notification.service';
import { SwPush } from '@angular/service-worker';
import { UpdateService } from './core/services/update.service';
import { NotificationMessage } from './core/models/notification-message';
import { CacheInspectorService } from './core/services/cache-inspector.service';
import { UserService } from './features/services/user.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  connectivityService = inject(ConnectivityService)
  notificationService = inject(NotificationService)
  cacheInspector = inject(CacheInspectorService)
  updateService = inject(UpdateService)
  userService = inject(UserService)
  swPush = inject(SwPush)
  title = 'contabilidade_App';

  async ngOnInit() {
    this.swPush.messages.subscribe((message) => {
      const noticationMessage = message as NotificationMessage;
      this.notificationService.showNotification('Notification', {body: noticationMessage.body});
    });

    const hasUpdate = await this.updateService.checkForUpdate();
    if (hasUpdate) {
      console.log('Atualização encontrada durante a inicialização');
    }
    this.cacheInspector.checkAssetsCache();
  }

  constructor() {
    effect(() => {
      if (!this.connectivityService.isOnline()) {
        this.notificationService.showNotification('Notificação', {body: 'Você está offline :('});
        return;
      }

      this.notificationService.showNotification('Notificação', {body: 'Você está online :)'});
    });
  }
}
