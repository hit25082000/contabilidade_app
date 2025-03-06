import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// NG-ZORRO
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTagModule } from 'ng-zorro-antd/tag';

// Serviços e modelos
import { PlantaoService } from '../../../services/plantao.service';
import { AuthStore } from '../../../../core/auth/service/auth.store';
import { IPlantao } from '../../../models/plantao.model';

/**
 * Componente para listagem de plantões
 * @class ListaPlantaoComponent
 */
@Component({
  selector: 'app-lista-plantao',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzPopconfirmModule,
    NzSpinModule,
    NzEmptyModule,
    NzCardModule,
    NzDividerModule,
    NzToolTipModule,
    NzGridModule,
    NzTagModule
  ],
  template: `
    <div class="container">
      <nz-card class="plantao-card">
        <div class="page-header">
          <div class="title-section">
            <h1>Meus Plantões</h1>
            <p>Visualize e gerencie seus registros de plantão</p>
          </div>
          
          <div class="actions-section">
            <button 
              nz-button 
              nzType="primary" 
              [routerLink]="['/plantoes/registrar']">
              <span nz-icon nzType="plus"></span>
              Registrar Plantão
            </button>
          </div>
        </div>
        
        <nz-divider></nz-divider>
        
        <div *ngIf="plantaoService.isLoading()" class="loading-container">
          <nz-spin nzTip="Carregando plantões..."></nz-spin>
        </div>
        
        <div *ngIf="!plantaoService.isLoading() && plantaoService.plantoes().length === 0" class="empty-container">
          <nz-empty 
            nzNotFoundImage="simple" 
            nzNotFoundContent="Nenhum plantão registrado"
            nzNotFoundFooter="Clique em 'Registrar Plantão' para adicionar seu primeiro registro">
          </nz-empty>
        </div>

        <!-- Visualização em tabela para desktop -->
        <div class="desktop-view" *ngIf="!plantaoService.isLoading() && plantaoService.plantoes().length > 0">
          <nz-table
            #basicTable
            [nzData]="plantaoService.plantoes()"
            [nzPageSize]="10"
            [nzShowPagination]="true"
            [nzLoading]="plantaoService.isLoading()"
            nzTableLayout="fixed"
            class="plantao-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Horário</th>
                <th>Hospital</th>
                <th>Duração</th>
                <th nzWidth="120px">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let plantao of basicTable.data">
                <td>{{ formatarData(plantao.data) }}</td>
                <td>{{ plantao.horario_inicio }} - {{ plantao.horario_fim }}</td>
                <td>{{ plantao.hospital }}</td>
                <td>{{ calcularDuracao(plantao.horario_inicio, plantao.horario_fim) }}</td>
                <td>
                  <div class="action-buttons">
                    <button 
                      nz-button 
                      nzType="text" 
                      nzShape="circle"
                      nz-tooltip
                      nzTooltipTitle="Visualizar detalhes"
                      (click)="visualizarPlantao(plantao)">
                      <span nz-icon nzType="eye"></span>
                    </button>
                    
                    <button 
                      nz-button 
                      nzType="text" 
                      nzShape="circle"
                      nz-tooltip
                      nzTooltipTitle="Excluir plantão"
                      nz-popconfirm
                      nzPopconfirmTitle="Tem certeza que deseja excluir este plantão?"
                      nzPopconfirmPlacement="left"
                      (nzOnConfirm)="excluirPlantao(plantao.id!)">
                      <span nz-icon nzType="delete"></span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </nz-table>
        </div>

        <!-- Visualização em cards para mobile -->
        <div class="mobile-view" *ngIf="!plantaoService.isLoading() && plantaoService.plantoes().length > 0">
          <div class="plantao-item-card" *ngFor="let plantao of plantaoService.plantoes()">
            <div class="plantao-item-header">
              <div class="plantao-item-data">
                <span nz-icon nzType="calendar" class="icon-info"></span>
                {{ formatarData(plantao.data) }}
              </div>
              <nz-tag [nzColor]="'blue'">{{ calcularDuracao(plantao.horario_inicio, plantao.horario_fim) }}</nz-tag>
            </div>
            
            <div class="plantao-item-content">
              <div class="info-row">
                <span nz-icon nzType="clock-circle" class="icon-info"></span>
                {{ plantao.horario_inicio }} - {{ plantao.horario_fim }}
              </div>
              <div class="info-row">
                <span nz-icon nzType="hospital" class="icon-info"></span>
                {{ plantao.hospital }}
              </div>
            </div>
            
            <div class="plantao-item-actions">
              <button 
                nz-button 
                nzType="default"
                nzSize="small"
                (click)="visualizarPlantao(plantao)">
                <span nz-icon nzType="eye"></span>
                Detalhes
              </button>
              
              <button 
                nz-button 
                nzType="default"
                nzDanger
                nzSize="small"
                nz-popconfirm
                nzPopconfirmTitle="Tem certeza que deseja excluir este plantão?"
                (nzOnConfirm)="excluirPlantao(plantao.id!)">
                <span nz-icon nzType="delete"></span>
                Excluir
              </button>
            </div>
          </div>
        </div>
      </nz-card>
    </div>
  `,
  styles: [`
    .container {
      padding: 16px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .plantao-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
    }
    
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 16px;
    }
    
    .title-section h1 {
      margin-bottom: 8px;
      font-size: 24px;
      font-weight: 500;
    }
    
    .title-section p {
      color: rgba(0, 0, 0, 0.45);
      margin-bottom: 0;
    }
    
    .loading-container, .empty-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
    }
    
    .action-buttons {
      display: flex;
      justify-content: space-around;
    }
    
    /* Responsividade para telas pequenas */
    @media (max-width: 576px) {
      .container {
        padding: 12px;
      }
      
      .plantao-card {
        border-radius: 4px;
      }
      
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
      
      .actions-section {
        width: 100%;
      }
      
      .actions-section button {
        width: 100%;
      }
      
      .title-section h1 {
        font-size: 20px;
      }
      
      :host ::ng-deep .ant-table {
        font-size: 12px;
      }
    }
    
    /* Responsividade para telas muito pequenas */
    @media (max-width: 400px) {
      .container {
        padding: 8px;
      }
      
      .plantao-card {
        box-shadow: none;
        border: none;
      }
      
      /* Ajustes para tabela responsiva */
      :host ::ng-deep .ant-table {
        overflow-x: auto;
      }

      :host ::ng-deep .ant-table-thead > tr > th,
      :host ::ng-deep .ant-table-tbody > tr > td {
        white-space: nowrap;
        padding: 8px 4px;
        font-size: 12px;
      }

      /* Esconde colunas menos importantes */
      :host ::ng-deep .ant-table-thead > tr > th:nth-child(2),
      :host ::ng-deep .ant-table-tbody > tr > td:nth-child(2) {
        display: none;
      }

      /* Ajusta botões de ação */
      .action-buttons {
        display: flex;
        gap: 4px;
      }

      .action-buttons button {
        min-width: 24px;
        width: 24px;
        height: 24px;
        padding: 0;
      }

      /* Ajusta ícones */
      :host ::ng-deep .anticon {
        font-size: 14px;
        margin: 0;
      }

      /* Ajusta tooltips */
      :host ::ng-deep .ant-tooltip {
        max-width: 200px;
      }

      /* Ajusta o layout do card */
      .plantao-card {
        padding: 12px;
      }

      .page-header {
        margin-bottom: 12px;
      }

      .title-section h1 {
        font-size: 18px;
      }
    }

    /* Estilos para visualização desktop/mobile */
    .desktop-view {
      display: block;
    }

    .mobile-view {
      display: none;
    }

    /* Estilos para cards de plantão */
    .plantao-item-card {
      border: 1px solid #f0f0f0;
      border-radius: 4px;
      padding: 16px;
      margin-bottom: 16px;
      background: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
    }

    .plantao-item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .plantao-item-data {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.85);
    }

    .plantao-item-content {
      margin-bottom: 12px;
    }

    .info-row {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      color: rgba(0, 0, 0, 0.65);
    }

    .icon-info {
      margin-right: 8px;
      color: #1890ff;
    }

    .plantao-item-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }

    /* Responsividade */
    @media (max-width: 768px) {
      .desktop-view {
        display: none;
      }

      .mobile-view {
        display: block;
      }

      .plantao-item-card {
        margin-bottom: 12px;
      }
    }

    @media (max-width: 400px) {
      .container {
        padding: 8px;
      }

      .plantao-card {
        padding: 12px;
      }

      .page-header {
        margin-bottom: 12px;
      }

      .title-section h1 {
        font-size: 18px;
      }

      .plantao-item-card {
        padding: 12px;
        margin-bottom: 8px;
      }

      .plantao-item-actions {
        flex-direction: column;
        gap: 4px;
      }

      .plantao-item-actions button {
        width: 100%;
      }

      :host ::ng-deep .ant-card-body {
        padding: 12px;
      }

      :host ::ng-deep .ant-tag {
        margin-right: 0;
      }
    }
  `]
})
export class ListaPlantaoComponent implements OnInit {
  // Injeção de dependências
  plantaoService = inject(PlantaoService);
  private authStore = inject(AuthStore);
  private message = inject(NzMessageService);
  private router = inject(Router);
  
  ngOnInit(): void {
    // Verifica se o usuário está autenticado e é um cliente
    if (!this.authStore.isAuthenticated() || !this.authStore.isCliente()) {
      this.message.error('Acesso não autorizado. Apenas clientes podem visualizar plantões.');
      this.router.navigate(['/']);
      return;
    }
    
    // Carrega os plantões do usuário
    this.plantaoService.reloadPlantoes();
  }
  
  /**
   * Formata a data para exibição
   * @param dataString - Data em formato ISO
   * @returns Data formatada
   */
  formatarData(dataString: string): string {
    if (!dataString) return '';
    
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  }
  
  /**
   * Calcula a duração do plantão
   * @param inicio - Horário de início
   * @param fim - Horário de término
   * @returns Duração formatada
   */
  calcularDuracao(inicio: string, fim: string): string {
    if (!inicio || !fim) return '';
    
    const [horaInicio, minInicio] = inicio.split(':').map(Number);
    const [horaFim, minFim] = fim.split(':').map(Number);
    
    let diferencaMinutos = (horaFim * 60 + minFim) - (horaInicio * 60 + minInicio);
    
    // Se a diferença for negativa, assume que o plantão passou da meia-noite
    if (diferencaMinutos < 0) {
      diferencaMinutos += 24 * 60;
    }
    
    const horas = Math.floor(diferencaMinutos / 60);
    const minutos = diferencaMinutos % 60;
    
    return `${horas}h ${minutos}min`;
  }
  
  /**
   * Navega para a visualização detalhada do plantão
   * @param plantao - Plantão a ser visualizado
   */
  visualizarPlantao(plantao: IPlantao): void {
    this.plantaoService.setSelectedPlantao(plantao.id!);
    this.router.navigate(['/plantoes/detalhes', plantao.id]);
  }
  
  /**
   * Exclui um plantão
   * @param id - ID do plantão a ser excluído
   */
  excluirPlantao(id: string): void {
    this.plantaoService.deletePlantao(id).subscribe({
      next: () => {
        this.message.success('Plantão excluído com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao excluir plantão:', error);
        this.message.error('Erro ao excluir plantão. Por favor, tente novamente.');
      }
    });
  }
} 