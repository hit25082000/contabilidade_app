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
    <nz-layout class="app-layout" [class.sidebar-collapsed]="isCollapsed">
      <!-- Sidebar compartilhado -->
      <app-cliente-sidebar 
        [isCollapsed]="isCollapsed"
        (collapsedChange)="onCollapsedChange($event)">
      </app-cliente-sidebar>
      
      <!-- Layout principal -->
      <nz-layout class="main-layout">
        <!-- Header compartilhado -->
        <app-cliente-header 
          [isCollapsed]="isCollapsed" 
          [notificationCount]="notificationCount()" 
          (collapsedChange)="onCollapsedChange($event)">
        </app-cliente-header>
        
        <!-- Conteúdo específico do cliente -->
        <nz-content class="main-content">
          <router-outlet></router-outlet>
        </nz-content>
      </nz-layout>
    </nz-layout>
  `,
  styles: [`
    .app-layout {
      min-height: 100vh;
    }

    .main-layout {
      margin-left: 256px;
      transition: margin-left 0.2s;
    }

    .sidebar-collapsed .main-layout {
      margin-left: 80px;
    }

    .main-content {
      padding: 24px;
      min-height: calc(100vh - 64px);
      background: #fff;
    }    
  `]
})
export class ClienteLayoutComponent {
  private authStore = inject(AuthStore);
  
  // Estado do sidebar
  isCollapsed = false;
  
  // Dados simulados para o dashboard
  notificationCount = signal<number>(2);

  // Método para lidar com a mudança do estado de colapso
  onCollapsedChange(collapsed: boolean): void {
    this.isCollapsed = collapsed;
  }
} 