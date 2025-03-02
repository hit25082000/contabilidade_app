import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthStore } from '../../core/store/auth.store';

// Importações do NG-ZORRO
import { NzLayoutModule } from 'ng-zorro-antd/layout';

// Componentes compartilhados
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/components/header/header.component';

/**
 * Componente de layout principal para o cliente
 * Renderiza o sidebar, header e o conteúdo específico do cliente
 * @class ClienteLayoutComponent
 */
@Component({
  selector: 'app-cliente-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NzLayoutModule,
    SidebarComponent,
    HeaderComponent
  ],
  template: `
    <nz-layout class="app-layout">
      <!-- Sidebar compartilhado -->
      <app-sidebar [isCollapsed]="isCollapsed"></app-sidebar>
      
      <!-- Layout principal -->
      <nz-layout>
        <!-- Header compartilhado -->
        <app-header 
          [isCollapsed]="isCollapsed" 
          [notificationCount]="notificationCount()" 
          (collapsedChange)="isCollapsed = $event">
        </app-header>
        
        <!-- Conteúdo específico do cliente -->
        <router-outlet></router-outlet>
      </nz-layout>
    </nz-layout>
  `,
  styles: [`
    .app-layout {
      min-height: 100vh;
    }
  `]
})
export class ClienteLayoutComponent {
  private authStore = inject(AuthStore);
  
  // Estado do sidebar
  isCollapsed = false;
  
  // Dados simulados para o dashboard
  notificationCount = signal<number>(2);
} 