import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../../core/auth/service/auth.store';
import { AuthService } from '../../../core/auth/service/auth.service';

// Importações do NG-ZORRO
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';

/**
 * Componente de header compartilhado
 * Exibe informações do usuário e controles de navegação
 * @class HeaderComponent
 */
@Component({
  selector: 'app-cliente-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NzLayoutModule,
    NzIconModule,
    NzBadgeModule,
    NzAvatarModule,
    NzDropDownModule,
    NzMenuModule
  ],
  template: `
    <nz-header>
      <div class="header-container">
        <div class="header-trigger" (click)="toggleSidebar()">
          <span nz-icon [nzType]="isCollapsed ? 'menu-unfold' : 'menu-fold'"></span>
        </div>
        <div class="header-actions">
          <span nz-icon nzType="bell" nzTheme="outline" class="notification-icon">
            <nz-badge [nzCount]="notificationCount" [nzDot]="notificationCount > 0"></nz-badge>
          </span>
          
          <a nz-dropdown [nzDropdownMenu]="userMenu" class="user-dropdown">
            <nz-avatar [nzText]="userInitials()" nzSize="small" class="user-avatar"></nz-avatar>
            <span class="user-name" *ngIf="user()">{{ user()?.nome_completo }}</span>
            <span nz-icon nzType="down"></span>
          </a>
          <nz-dropdown-menu #userMenu="nzDropdownMenu">
            <ul nz-menu>
              <li nz-menu-item routerLink="/perfil">
                <span nz-icon nzType="user"></span> Meu Perfil
              </li>
              <li nz-menu-item routerLink="/configuracoes">
                <span nz-icon nzType="setting"></span> Configurações
              </li>
              <li nz-menu-divider></li>
              <li nz-menu-item (click)="logout()">
                <span nz-icon nzType="logout"></span> Sair
              </li>
            </ul>
          </nz-dropdown-menu>
        </div>
      </div>
    </nz-header>
  `,
  styles: [`
    nz-header {
      padding: 0;
      width: 100%;
      z-index: 2;
      background: #fff;
      box-shadow: 0 1px 4px rgba(0,21,41,.08);
    }
    
    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 64px;
      padding: 0 16px;
    }
    
    .header-trigger {
      font-size: 20px;
      cursor: pointer;
      transition: all .3s;
      padding: 0 24px;
    }
    
    .header-trigger:hover {
      color: #1890ff;
    }
    
    .header-actions {
      display: flex;
      align-items: center;
    }
    
    .notification-icon {
      font-size: 18px;
      margin-right: 24px;
      cursor: pointer;
    }
    
    .user-dropdown {
      display: flex;
      align-items: center;
      cursor: pointer;
    }
    
    .user-avatar {
      margin-right: 8px;
      background-color: #1890ff;
    }
    
    .user-name {
      font-size: 14px;
      margin-right: 8px;
    }
    
    /* Responsividade para dispositivos móveis */
    @media (max-width: 768px) {
      .header-actions .user-name {
        display: none;
      }
    }
  `]
})
export class ClienteHeaderComponent {
  private authStore = inject(AuthStore);
  private authService = inject(AuthService);
  
  // Inputs e Outputs
  @Input() isCollapsed = false;
  @Input() notificationCount = 0;
  @Output() collapsedChange = new EventEmitter<boolean>();
  
  // Signals do AuthStore
  user = this.authStore.user;
  
  /**
   * Alterna o estado de colapso do sidebar
   */
  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.collapsedChange.emit(this.isCollapsed);
  }
  
  /**
   * Retorna as iniciais do nome do usuário para exibição no avatar
   * @returns string com as iniciais do usuário
   */
  userInitials(): string {
    const nome = this.user()?.nome_completo || '';
    if (!nome) return '?';
    
    const partes = nome.split(' ');
    if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
    
    return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
  }
  
  /**
   * Realiza o logout do usuário
   */
  logout(): void {
    this.authService.logout().subscribe();
  }
} 