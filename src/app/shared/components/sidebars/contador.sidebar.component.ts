import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStore } from '../../../core/auth/service/auth.store';

// Importações do NG-ZORRO
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';

/**
 * Componente de sidebar compartilhado
 * Exibe diferentes menus com base no papel do usuário (contador ou cliente)
 * @class SidebarComponent
 */
@Component({
  selector: 'app-contador-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule
  ],
  template: `
    <nz-sider
      class="menu-sidebar"
      nzCollapsible
      nzWidth="256px"
      nzBreakpoint="md"
      [(nzCollapsed)]="isCollapsed"
      (nzCollapsedChange)="collapsedChange.emit($event)"
      [nzTrigger]="null">
      <div class="sidebar-logo">
        <a routerLink="/contador/dashboard">
          <span nz-icon nzType="audit" nzTheme="outline"></span>
          <h1 *ngIf="!isCollapsed">Contabilidade App</h1>
        </a>
      </div>
      <ul nz-menu nzTheme="dark" nzMode="inline" [nzInlineCollapsed]="isCollapsed">
        <li nz-menu-item nzSelected routerLink="/contador/dashboard" routerLinkActive="ant-menu-item-selected">
          <span nz-icon nzType="dashboard"></span>
          <span>Dashboard</span>
        </li>
        
        <!-- Menu para Contador -->
        <ng-container *ngIf="isContador()">
          <li nz-submenu nzTitle="Clientes" nzIcon="team">
            <ul>
              <li nz-menu-item routerLink="/contador/clientes" routerLinkActive="ant-menu-item-selected">Lista de Clientes</li>
              <li nz-menu-item routerLink="/contador/clientes/novo" routerLinkActive="ant-menu-item-selected">Adicionar Cliente</li>
            </ul>
          </li>
          <li nz-submenu nzTitle="Documentos" nzIcon="file-text">
            <ul>
              <li nz-menu-item routerLink="/contador/documentos/recebidos" routerLinkActive="ant-menu-item-selected">Documentos Recebidos</li>
              <li nz-menu-item routerLink="/contador/documentos/enviar" routerLinkActive="ant-menu-item-selected">Enviar Documentos</li>
            </ul>
          </li>
          <li nz-menu-item routerLink="/contador/agenda" routerLinkActive="ant-menu-item-selected">
            <span nz-icon nzType="calendar"></span>
            <span>Agenda Fiscal</span>
          </li>
          <li nz-menu-item routerLink="/contador/relatorios" routerLinkActive="ant-menu-item-selected">
            <span nz-icon nzType="bar-chart"></span>
            <span>Relatórios</span>
          </li>
        </ng-container>
        
        <!-- Menu para Cliente -->
        <ng-container *ngIf="isCliente()">
          <li nz-submenu nzTitle="Documentos" nzIcon="file-text">
            <ul>
              <li nz-menu-item routerLink="/cliente/documentos" routerLinkActive="ant-menu-item-selected">Meus Documentos</li>
              <li nz-menu-item routerLink="/cliente/documentos/enviar" routerLinkActive="ant-menu-item-selected">Enviar Documentos</li>
            </ul>
          </li>
          <li nz-menu-item routerLink="/cliente/plantao" routerLinkActive="ant-menu-item-selected">
            <span nz-icon nzType="clock-circle"></span>
            <span>Registrar Plantão</span>
          </li>
          <li nz-menu-item routerLink="/cliente/agenda" routerLinkActive="ant-menu-item-selected">
            <span nz-icon nzType="calendar"></span>
            <span>Agenda</span>
          </li>
        </ng-container>
        
        <li nz-menu-item routerLink="/configuracoes" routerLinkActive="ant-menu-item-selected">
          <span nz-icon nzType="setting"></span>
          <span>Configurações</span>
        </li>
      </ul>
    </nz-sider>
  `,
  styles: [`
    .menu-sidebar {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      z-index: 1000;
      height: 100vh;
      box-shadow: 2px 0 6px rgba(0,21,41,.35);
      overflow-y: auto;
      background: #001529;
    }
    
    :host ::ng-deep .ant-layout-has-sider {
      padding-left: 256px;
      transition: padding-left 0.2s;
    }

    :host ::ng-deep .ant-layout-has-sider.sidebar-collapsed {
      padding-left: 80px;
    }
    
    .sidebar-logo {
      position: sticky;
      top: 0;
      height: 64px;
      padding-left: 24px;
      overflow: hidden;
      line-height: 64px;
      background: #001529;
      transition: all .3s;
      z-index: 1001;
    }
    
    .sidebar-logo a {
      display: flex;
      align-items: center;
      height: 100%;
    }
    
    .sidebar-logo h1 {
      display: inline-block;
      margin: 0 0 0 12px;
      color: #fff;
      font-weight: 600;
      font-size: 18px;
      vertical-align: middle;
    }
    
    .sidebar-logo span[nz-icon] {
      color: #fff;
      font-size: 24px;
    }

    :host {
      display: block;
      height: 100%;
    }

    nz-sider {
      height: 100vh;
    }

    ul[nz-menu] {
      height: calc(100vh - 64px);
      overflow-y: auto;
      overflow-x: hidden;
    }
  `]
})
export class ContadorSidebarComponent {
  private authStore = inject(AuthStore);
  
  // Input para controlar o estado de colapso do sidebar
  @Input() isCollapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();
  
  // Signals do AuthStore
  isContador = this.authStore.isContador;
  isCliente = this.authStore.isCliente;
} 