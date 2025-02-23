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
import { RenderDetectorService } from './core/services/render-detector.service';
import { LoadingService } from './core/services/loading.service';
import { LoadingOverlayComponent } from "./core/components/loading/loading.component";

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, CommonModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
  connectivityService = inject(ConnectivityService)
  notificationService = inject(NotificationService)
  cacheInspector = inject(CacheInspectorService)
  updateService = inject(UpdateService)
  swPush = inject(SwPush)
  renderDetector = inject(RenderDetectorService)
  title = 'contabilidade_App';

  async ngOnInit() {

    // this.swPush.messages.subscribe((message) => {
    //   const noticationMessage = message as NotificationMessage;
    //   this.notificationService.showNotification('Notification', {body: noticationMessage.body});
    // });

    // const hasUpdate = await this.updateService.checkForUpdate();
    // if (hasUpdate) {
    //   console.log('Atualização encontrada durante a inicialização');
    // }
    // this.cacheInspector.checkAssetsCache();
    // this.renderDetector.detectRenderType();
  }

  constructor() {
    // effect(() => {
    //   if (!this.connectivityService.isOnline()) {
    //     this.notificationService.showNotification('Notificação', {body: 'Você está offline :('});
    //     return;
    //   }

    //   this.notificationService.showNotification('Notificação', {body: 'Você está online :)'});
    // });
  }
}
