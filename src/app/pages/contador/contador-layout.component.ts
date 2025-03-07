import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthStore } from '../../core/auth/service/auth.store';

// Importações do NG-ZORRO
import { NzLayoutModule } from 'ng-zorro-antd/layout';

// Componentes compartilhados
import { ContadorSidebarComponent } from '../../shared/components/sidebars/contador.sidebar.component';
import { ContadorHeaderComponent } from '../../shared/components/headers/contador.header.component';

/**
 * Componente de layout principal para o contador
 * Renderiza o sidebar, header e o conteúdo específico do contador
 * @class ContadorLayoutComponent
 */
@Component({
  selector: 'app-contador-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NzLayoutModule,
    ContadorSidebarComponent,
    ContadorHeaderComponent
  ],
  template: `
    <nz-layout class="app-layout" [class.sidebar-collapsed]="isCollapsed">
      <!-- Sidebar compartilhado -->
      <app-contador-sidebar 
        [isCollapsed]="isCollapsed"
        (collapsedChange)="onCollapsedChange($event)">
      </app-contador-sidebar>
      
      <!-- Layout principal -->
      <nz-layout class="main-layout">
        <!-- Header compartilhado -->
        <app-contador-header 
          [isCollapsed]="isCollapsed" 
          [notificationCount]="notificationCount()" 
          (collapsedChange)="onCollapsedChange($event)">
        </app-contador-header>
        
        <!-- Conteúdo específico do contador -->
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
export class ContadorLayoutComponent {
  private authStore = inject(AuthStore);
  
  // Estado do sidebar
  isCollapsed = false;
  
  // Dados simulados para o dashboard
  notificationCount = signal<number>(3);

  // Método para lidar com a mudança do estado de colapso
  onCollapsedChange(collapsed: boolean): void {
    this.isCollapsed = collapsed;
  }
} 