import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthStore } from '../../core/auth/service/auth.store';

// Importações do NG-ZORRO
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { ClienteSidebarComponent } from '../../shared/components/sidebars/cliente.sidebar.component';
import { ClienteHeaderComponent } from '../../shared/components/headers/cliente.header.component';

// Componentes compartilhados

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
    ClienteSidebarComponent,
    ClienteHeaderComponent
  ],
  template: `
    <nz-layout class="app-layout">
      <!-- Sidebar compartilhado -->
      <app-cliente-sidebar [isCollapsed]="isCollapsed"></app-cliente-sidebar>
      
      <!-- Layout principal -->
      <nz-layout>
        <!-- Header compartilhado -->
        <app-cliente-header 
          [isCollapsed]="isCollapsed" 
          [notificationCount]="notificationCount()" 
          (collapsedChange)="isCollapsed = $event">
        </app-cliente-header>
        
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