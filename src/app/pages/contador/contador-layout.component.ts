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
    <nz-layout class="app-layout">
      <!-- Sidebar compartilhado -->
      <app-contador-sidebar [isCollapsed]="isCollapsed"></app-contador-sidebar>
      
      <!-- Layout principal -->
      <nz-layout>
        <!-- Header compartilhado -->
        <app-contador-header 
          [isCollapsed]="isCollapsed" 
          [notificationCount]="notificationCount()" 
          (collapsedChange)="isCollapsed = $event">
        </app-contador-header>
        
        <!-- Conteúdo específico do contador -->
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
export class ContadorLayoutComponent {
  private authStore = inject(AuthStore);
  
  // Estado do sidebar
  isCollapsed = false;
  
  // Dados simulados para o dashboard
  notificationCount = signal<number>(3);
} 