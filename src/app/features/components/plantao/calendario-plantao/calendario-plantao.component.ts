import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// NG-ZORRO
import { NzCalendarModule } from 'ng-zorro-antd/calendar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzRadioModule } from 'ng-zorro-antd/radio';

// Serviços e modelos
import { PlantaoService } from '../../../services/plantao.service';
import { AuthStore } from '../../../../core/auth/service/auth.store';
import { IPlantao } from '../../../models/plantao.model';

/**
 * Componente para visualização de plantões em calendário
 * @class CalendarioPlantaoComponent
 */
@Component({
  selector: 'app-calendario-plantao',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NzCalendarModule,
    NzBadgeModule,
    NzButtonModule,
    NzIconModule,
    NzSpinModule,
    NzCardModule,
    NzDividerModule,
    NzToolTipModule,
    NzGridModule,
    NzPopoverModule,
    NzSelectModule,
    NzRadioModule
  ],
  template: `
    <div class="container">
      <nz-card class="calendario-card">
        <div class="page-header">
          <div class="title-section">
            <h1>Calendário de Plantões</h1>
            <p>Visualize seus plantões no calendário</p>
          </div>
          
          <div class="actions-section">
            <nz-radio-group [(ngModel)]="modoVisualizacao" class="modo-visualizacao">
              <label nz-radio-button nzValue="month">Mês</label>
              <label nz-radio-button nzValue="year">Ano</label>
            </nz-radio-group>
            
            <button 
              nz-button 
              nzType="primary" 
              [routerLink]="['/plantoes']">
              <span nz-icon nzType="unordered-list"></span>
              Ver Lista
            </button>
            
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
        
        <div *ngIf="!plantaoService.isLoading()">
          <nz-calendar 
            [(ngModel)]="dataSelecionada" 
            [nzMode]="modoVisualizacao"
            (nzSelectChange)="onDateSelect($event)"
            (nzPanelChange)="onPanelChange($event)">
            
            <ng-container *nzDateCell="let date">
              <div class="ant-calendar-date">
                <div class="plantoes-do-dia">
                  <ng-container *ngFor="let plantao of getPlantoesDoDia(date)">
                    <nz-badge 
                      [nzCount]="1" 
                      [nzStyle]="{ backgroundColor: '#1890ff' }"
                      nz-popover
                      [nzPopoverTitle]="'Plantão em ' + plantao.hospital"
                      [nzPopoverContent]="plantaoPopoverContent"
                      nzPopoverPlacement="top"
                      class="plantao-badge">
                      <ng-template #plantaoPopoverContent>
                        <p><strong>Data:</strong> {{ formatarData(plantao.data) }}</p>
                        <p><strong>Horário:</strong> {{ plantao.horario_inicio }} - {{ plantao.horario_fim }}</p>
                        <p><strong>Duração:</strong> {{ calcularDuracao(plantao.horario_inicio, plantao.horario_fim) }}</p>
                        <p><strong>Hospital:</strong> {{ plantao.hospital }}</p>
                        <p *ngIf="plantao.setor"><strong>Setor:</strong> {{ plantao.setor }}</p>
                        <div class="popover-actions">
                          <button nz-button nzType="primary" nzSize="small" (click)="visualizarPlantao(plantao)">
                            <span nz-icon nzType="eye"></span> Detalhes
                          </button>
                        </div>
                      </ng-template>
                    </nz-badge>
                  </ng-container>
                </div>
              </div>
            </ng-container>
            
            <ng-container *nzMonthCell="let month">
              <div class="ant-calendar-date">
                {{ getMonthName(month) }}
                <div class="plantoes-do-mes">
                  <nz-badge 
                    *ngIf="getQuantidadePlantoesMes(month) > 0"
                    [nzCount]="getQuantidadePlantoesMes(month)" 
                    [nzOverflowCount]="99"
                    class="plantao-badge-mes">
                  </nz-badge>
                </div>
              </div>
            </ng-container>
            
          </nz-calendar>
        </div>
      </nz-card>
    </div>
  `,
  styles: [`
    .container {
      padding: 16px;
      max-width: 1200px;
      margin: 0 auto;
      max-height: 100vh;
      overflow-y: auto;
    }
    
    .calendario-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
      overflow: hidden;
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
    
    .actions-section {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    
    .modo-visualizacao {
      margin-right: 8px;
    }
    
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
    }
    
    .plantoes-do-dia {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-top: 4px;
    }
    
    .plantao-badge {
      margin-right: 4px;
    }
    
    .plantao-badge-mes {
      margin-top: 4px;
    }
    
    .popover-actions {
      margin-top: 8px;
      display: flex;
      justify-content: flex-end;
    }
    
    /* Ajustes específicos para o calendário */
    :host ::ng-deep .ant-fullcalendar {
      border: 1px solid #f0f0f0;
      border-radius: 4px;
      background: #fff;
    }

    :host ::ng-deep .ant-fullcalendar-header {
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;
    }

    :host ::ng-deep .ant-fullcalendar-date {
      margin: 4px;
      padding: 4px;
      height: auto;
      min-height: 60px;
    }

    :host ::ng-deep .ant-badge {
      display: inline-block;
      margin: 2px;
    }
    
    /* Ajustes para o calendário */
    :host ::ng-deep .ant-picker-panel {
      max-height: calc(100vh - 200px);
      overflow-y: auto;
      -webkit-overflow-scrolling: touch; /* Para melhor scroll em iOS */
    }

    :host ::ng-deep .ant-picker-panel-container {
      max-height: inherit;
      overflow: hidden;
    }

    :host ::ng-deep .ant-fullcalendar-calendar-body {
      height: auto;
      overflow-y: auto;
    }

    /* Estilização da barra de rolagem */
    :host ::ng-deep .ant-picker-panel::-webkit-scrollbar {
      width: 6px;
    }

    :host ::ng-deep .ant-picker-panel::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 3px;
    }

    :host ::ng-deep .ant-picker-panel::-webkit-scrollbar-track {
      background-color: rgba(0, 0, 0, 0.05);
    }

    /* Responsividade para telas pequenas */
    @media (max-width: 768px) {
      .container {
        padding: 12px;
        max-height: calc(100vh - 32px);
      }

      .actions-section {
        flex-direction: column;
        gap: 8px;
      }

      .actions-section button {
        width: 100%;
      }

      .modo-visualizacao {
        width: 100%;
      }

      :host ::ng-deep .ant-radio-group {
        display: flex;
        width: 100%;
      }

      :host ::ng-deep .ant-radio-button-wrapper {
        flex: 1;
        text-align: center;
      }

      :host ::ng-deep .ant-fullcalendar-header {
        padding: 12px;
      }

      :host ::ng-deep .ant-fullcalendar-date {
        margin: 2px;
        padding: 2px;
        min-height: 50px;
      }

      :host ::ng-deep .ant-picker-panel {
        max-height: calc(100vh - 150px);
      }
    }

    /* Responsividade para telas muito pequenas */
    @media (max-width: 400px) {
      .container {
        padding: 8px;
        max-height: calc(100vh - 16px);
      }

      .calendario-card {
        padding: 8px;
      }

      :host ::ng-deep .ant-fullcalendar-header {
        padding: 8px;
      }

      :host ::ng-deep .ant-fullcalendar-date {
        margin: 1px;
        padding: 1px;
        min-height: 40px;
      }

      :host ::ng-deep .ant-fullcalendar-column-header {
        padding: 0;
        font-size: 12px;
      }

      :host ::ng-deep .ant-fullcalendar-date-value {
        font-size: 12px;
      }

      :host ::ng-deep .ant-badge {
        transform: scale(0.8);
        margin: 1px;
      }

      /* Ajusta o popover para telas pequenas */
      :host ::ng-deep .ant-popover {
        max-width: 250px;
      }

      :host ::ng-deep .ant-popover-inner-content {
        padding: 8px;
      }

      :host ::ng-deep .ant-popover-inner-content p {
        margin-bottom: 4px;
        font-size: 12px;
      }

      /* Ajusta os botões no popover */
      .popover-actions button {
        font-size: 12px;
        height: 24px;
        padding: 0 8px;
      }

      /* Ajusta o layout do cabeçalho */
      .page-header {
        margin-bottom: 12px;
      }

      .title-section h1 {
        font-size: 18px;
        margin-bottom: 4px;
      }

      .title-section p {
        font-size: 12px;
      }

      /* Ajusta os botões de ação */
      .actions-section button {
        font-size: 12px;
        height: 28px;
      }

      /* Ajusta os radio buttons */
      :host ::ng-deep .ant-radio-button-wrapper {
        padding: 0 8px;
        font-size: 12px;
        height: 28px;
        line-height: 26px;
      }

      :host ::ng-deep .ant-picker-panel {
        max-height: calc(100vh - 100px);
      }
    }
  `]
})
export class CalendarioPlantaoComponent implements OnInit {
  // Injeção de dependências
  plantaoService = inject(PlantaoService);
  private authStore = inject(AuthStore);
  private message = inject(NzMessageService);
  private router = inject(Router);
  
  // Propriedades do componente
  dataSelecionada = new Date();
  modoVisualizacao: 'month' | 'year' = 'month';
  
  ngOnInit(): void {
    // Verifica se o usuário está autenticado e é um cliente
    if (!this.authStore.isAuthenticated() || !this.authStore.isCliente()) {
      this.message.error('Acesso não autorizado. Apenas clientes podem visualizar plantões.');
      this.router.navigate(['/dashboard']);
      return;
    }
    
    // Carrega os plantões do usuário
    this.plantaoService.reloadPlantoes();
  }
  
  /**
   * Manipula a seleção de uma data no calendário
   * @param date - Data selecionada
   */
  onDateSelect(date: Date): void {
    this.dataSelecionada = date;
    
    // Se estiver no modo de visualização anual, muda para mensal ao selecionar um mês
    if (this.modoVisualizacao === 'year') {
      this.modoVisualizacao = 'month';
    }
  }
  
  /**
   * Manipula a mudança de painel no calendário
   * @param mode - Modo de visualização
   */
  onPanelChange(mode: { date: Date, mode: 'month' | 'year' }): void {
    this.dataSelecionada = mode.date;
    this.modoVisualizacao = mode.mode;
  }
  
  /**
   * Obtém os plantões de um dia específico
   * @param date - Data para buscar os plantões
   * @returns Lista de plantões do dia
   */
  getPlantoesDoDia(date: Date): IPlantao[] {
    const dataFormatada = this.formatarDataISO(date);
    return this.plantaoService.plantoes().filter(plantao => plantao.data === dataFormatada);
  }
  
  /**
   * Obtém a quantidade de plantões em um mês específico
   * @param month - Mês para buscar os plantões
   * @returns Quantidade de plantões no mês
   */
  getQuantidadePlantoesMes(month: Date): number {
    const ano = month.getFullYear();
    const mes = month.getMonth();
    
    return this.plantaoService.plantoes().filter(plantao => {
      const dataPlantao = new Date(plantao.data);
      return dataPlantao.getFullYear() === ano && dataPlantao.getMonth() === mes;
    }).length;
  }
  
  /**
   * Obtém o nome do mês
   * @param date - Data para obter o nome do mês
   * @returns Nome do mês
   */
  getMonthName(date: Date): string {
    return date.toLocaleString('pt-BR', { month: 'long' });
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
   * Formata a data para o formato ISO (YYYY-MM-DD)
   * @param date - Data a ser formatada
   * @returns Data formatada
   */
  formatarDataISO(date: Date): string {
    const ano = date.getFullYear();
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const dia = date.getDate().toString().padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
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
} 