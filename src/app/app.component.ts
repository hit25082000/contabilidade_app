import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConnectivityService } from './core/services/connectivity.service';
import { NotificationService } from './core/services/notification.service';
import { SwPush } from '@angular/service-worker';
import { UpdateService } from './core/services/update.service';
import { NotificationMessage } from './core/models/notification-message';
import { CacheInspectorService } from './core/services/cache-inspector.service';
import { CommonModule } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { LoadingOverlayComponent } from "./core/components/loading/loading.component";

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, CommonModule, LoadingOverlayComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
  connectivityService = inject(ConnectivityService)
  notificationService = inject(NotificationService)
  cacheInspector = inject(CacheInspectorService)
  updateService = inject(UpdateService)
  swPush = inject(SwPush)
  title = inject(Title)
  meta = inject(Meta)   

  constructor() {
    effect(() => {
      if (!this.connectivityService.isOnline()) {
        this.notificationService.showNotification('Notificação', {body: 'Você está offline :('});
        return;
      }

      this.notificationService.showNotification('Notificação', {body: 'Você está online :)'});
    });
  }

  async ngOnInit() {
    this.setPageMeta();
    this.swPush.messages.subscribe((message) => {
      const noticationMessage = message as NotificationMessage;
      this.notificationService.showNotification('Notification', {body: noticationMessage.body});
    });

    const hasUpdate = await this.updateService.checkForUpdate();
    if (hasUpdate) {
      ('Atualização encontrada durante a inicialização');
    }
    this.cacheInspector.checkAssetsCache();
  }

  setPageMeta():void {
    this.title.setTitle('Deleite - a melhor experiência de sabores!');
    this.meta.addTags([
      { name: 'description', content: 'Descubra os melhores milkshakes, sorvetes e smoothies na Deleite. Sabor e qualidade em cada produto!' },
      { property: 'og:title', content: 'Deleite - a melhor experiência de sabores!' },
      { property: 'og:description', content: 'Descubra os melhores milkshakes, sorvetes e smoothies na Deleite. Sabor e qualidade em cada produto!' },
      { property: 'og:image', content: 'assets/images/logo.png' },
      { name: 'twitter:card', content: 'summary_large_image' }
    ]);
  }
}