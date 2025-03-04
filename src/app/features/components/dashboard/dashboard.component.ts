import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../../core/auth/service/auth.store';

// Importações do NG-ZORRO
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

/**
 * Componente de dashboard
 * Exibe diferentes conteúdos com base no papel do usuário (contador ou cliente)
 * @class DashboardComponent
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NzLayoutModule,
    NzBreadCrumbModule,
    NzCardModule,
    NzGridModule,
    NzStatisticModule,
    NzButtonModule,
    NzIconModule,
    NzTableModule,
    NzTagModule,
    NzEmptyModule
  ],
  template: `
    <nz-content>
      <div class="inner-content">
        <!-- Breadcrumb -->
        <nz-breadcrumb>
          <nz-breadcrumb-item>Home</nz-breadcrumb-item>
          <nz-breadcrumb-item>Dashboard</nz-breadcrumb-item>
        </nz-breadcrumb>
        
        <!-- Título da página -->
        <div class="page-header">
          <h1>Dashboard</h1>
          <p>Bem-vindo(a), {{ user()?.nome_completo }}!</p>
        </div>
        
        <!-- Cards de estatísticas -->
        <div nz-row [nzGutter]="16">
          <!-- Dashboard para Contador -->
          <ng-container *ngIf="isContador()">
            <div nz-col [nzXs]="24" [nzSm]="12" [nzMd]="8" [nzLg]="6" class="mb-4">
              <nz-card>
                <nz-statistic 
                  [nzValue]="contadorStats.totalClientes" 
                  [nzTitle]="'Total de Clientes'" 
                  [nzPrefix]="prefixTotalClientes">
                </nz-statistic>
                <ng-template #prefixTotalClientes><span nz-icon nzType="team"></span></ng-template>
              </nz-card>
            </div>
            <div nz-col [nzXs]="24" [nzSm]="12" [nzMd]="8" [nzLg]="6" class="mb-4">
              <nz-card>
                <nz-statistic 
                  [nzValue]="contadorStats.documentosPendentes" 
                  [nzTitle]="'Documentos Pendentes'" 
                  [nzPrefix]="prefixDocPendentes"
                  [nzValueStyle]="{ color: '#ff4d4f' }">
                </nz-statistic>
                <ng-template #prefixDocPendentes><span nz-icon nzType="file-exclamation"></span></ng-template>
              </nz-card>
            </div>
            <div nz-col [nzXs]="24" [nzSm]="12" [nzMd]="8" [nzLg]="6" class="mb-4">
              <nz-card>
                <nz-statistic 
                  [nzValue]="contadorStats.tarefasHoje" 
                  [nzTitle]="'Tarefas para Hoje'" 
                  [nzPrefix]="prefixTarefasHoje">
                </nz-statistic>
                <ng-template #prefixTarefasHoje><span nz-icon nzType="calendar"></span></ng-template>
              </nz-card>
            </div>
            <div nz-col [nzXs]="24" [nzSm]="12" [nzMd]="8" [nzLg]="6" class="mb-4">
              <nz-card>
                <nz-statistic 
                  [nzValue]="contadorStats.declaracoesMes" 
                  [nzTitle]="'Declarações do Mês'" 
                  [nzPrefix]="prefixDeclaracoes">
                </nz-statistic>
                <ng-template #prefixDeclaracoes><span nz-icon nzType="file-done"></span></ng-template>
              </nz-card>
            </div>
          </ng-container>
          
          <!-- Dashboard para Cliente -->
          <ng-container *ngIf="isCliente()">
            <div nz-col [nzXs]="24" [nzSm]="12" [nzMd]="8" [nzLg]="6" class="mb-4">
              <nz-card>
                <nz-statistic 
                  [nzValue]="clienteStats.documentosEnviados" 
                  [nzTitle]="'Documentos Enviados'" 
                  [nzPrefix]="prefixDocEnviados">
                </nz-statistic>
                <ng-template #prefixDocEnviados><span nz-icon nzType="file-done"></span></ng-template>
              </nz-card>
            </div>
            <div nz-col [nzXs]="24" [nzSm]="12" [nzMd]="8" [nzLg]="6" class="mb-4">
              <nz-card>
                <nz-statistic 
                  [nzValue]="clienteStats.documentosPendentes" 
                  [nzTitle]="'Documentos Pendentes'" 
                  [nzPrefix]="prefixDocPendentes"
                  [nzValueStyle]="{ color: '#ff4d4f' }">
                </nz-statistic>
                <ng-template #prefixDocPendentes><span nz-icon nzType="file-exclamation"></span></ng-template>
              </nz-card>
            </div>
            <div nz-col [nzXs]="24" [nzSm]="12" [nzMd]="8" [nzLg]="6" class="mb-4">
              <nz-card>
                <nz-statistic 
                  [nzValue]="clienteStats.horasPlantao" 
                  [nzTitle]="'Horas de Plantão'" 
                  [nzPrefix]="prefixHorasPlantao">
                </nz-statistic>
                <ng-template #prefixHorasPlantao><span nz-icon nzType="clock-circle"></span></ng-template>
              </nz-card>
            </div>
            <div nz-col [nzXs]="24" [nzSm]="12" [nzMd]="8" [nzLg]="6" class="mb-4">
              <nz-card>
                <nz-statistic 
                  [nzValue]="clienteStats.proximaReuniao" 
                  [nzTitle]="'Próxima Reunião'" 
                  [nzPrefix]="prefixProximaReuniao"
                  [nzValueStyle]="{ color: '#1890ff' }">
                </nz-statistic>
                <ng-template #prefixProximaReuniao><span nz-icon nzType="calendar"></span></ng-template>
              </nz-card>
            </div>
          </ng-container>
        </div>
        
        <!-- Seção de atividades recentes -->
        <nz-card class="mb-4">
          <div class="card-header">
            <h2>Atividades Recentes</h2>
            <button nz-button nzType="link">Ver todas</button>
          </div>
          
          <nz-table #atividadesTable [nzData]="atividadesRecentes" [nzShowPagination]="false" nzSize="small">
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let atividade of atividadesTable.data">
                <td>{{ formatarData(atividade.data) }}</td>
                <td>{{ atividade.descricao }}</td>
                <td>
                  <nz-tag [nzColor]="getStatusColor(atividade.status)">
                    {{ atividade.status }}
                  </nz-tag>
                </td>
              </tr>
            </tbody>
          </nz-table>
          
          <nz-empty 
            *ngIf="atividadesRecentes.length === 0" 
            nzNotFoundContent="Nenhuma atividade recente encontrada">
          </nz-empty>
        </nz-card>
        
        <!-- Seção específica para Contador -->
        <ng-container *ngIf="isContador()">
          <nz-card class="mb-4">
            <div class="card-header">
              <h2>Clientes Recentes</h2>
              <button nz-button nzType="link">Ver todos</button>
            </div>
            
            <nz-table #clientesTable [nzData]="clientesRecentes" [nzShowPagination]="false" nzSize="small">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Empresa</th>
                  <th>Último Acesso</th>
                  <th>Pendências</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let cliente of clientesTable.data">
                  <td>{{ cliente.nome }}</td>
                  <td>{{ cliente.empresa }}</td>
                  <td>{{ formatarData(cliente.ultimoAcesso) }}</td>
                  <td>
                    <nz-tag [nzColor]="cliente.documentosPendentes > 0 ? 'red' : 'green'">
                      {{ cliente.documentosPendentes }} docs
                    </nz-tag>
                  </td>
                  <td>
                    <a nz-button nzType="link" nzSize="small">Detalhes</a>
                  </td>
                </tr>
              </tbody>
            </nz-table>
            
            <nz-empty 
              *ngIf="clientesRecentes.length === 0" 
              nzNotFoundContent="Nenhum cliente recente encontrado">
            </nz-empty>
          </nz-card>
        </ng-container>
        
        <!-- Seção específica para Cliente -->
        <ng-container *ngIf="isCliente()">
          <!-- Card de Documentos Recentes -->
          <nz-card class="mb-4">
            <div class="card-header">
              <h2>Documentos Recentes</h2>
              <button nz-button nzType="link" routerLink="/cliente/documentos">Ver todos</button>
            </div>
            
            <nz-table #documentosTable [nzData]="documentosRecentes" [nzShowPagination]="false" nzSize="small">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let documento of documentosTable.data">
                  <td>{{ documento.nome }}</td>
                  <td>{{ documento.tipo }}</td>
                  <td>{{ formatarData(documento.data) }}</td>
                  <td>
                    <nz-tag [nzColor]="getStatusColor(documento.status)">
                      {{ documento.status }}
                    </nz-tag>
                  </td>
                  <td>
                    <a nz-button nzType="link" nzSize="small">Visualizar</a>
                  </td>
                </tr>
              </tbody>
            </nz-table>
            
            <nz-empty 
              *ngIf="documentosRecentes.length === 0" 
              nzNotFoundContent="Nenhum documento recente encontrado">
            </nz-empty>
          </nz-card>
          
          <!-- Card de Plantões Recentes -->
          <nz-card class="mb-4">
            <div class="card-header">
              <h2>Plantões Recentes</h2>
              <div class="card-actions">
                <button nz-button nzType="primary" routerLink="/cliente/plantoes/registrar">
                  <span nz-icon nzType="plus"></span>
                  Registrar Plantão
                </button>
                <button nz-button nzType="default" routerLink="/cliente/plantoes">
                  <span nz-icon nzType="unordered-list"></span>
                  Ver Todos
                </button>
              </div>
            </div>
            
            <div class="plantoes-cards">
              <div nz-row [nzGutter]="16">
                <div nz-col [nzXs]="24" [nzSm]="12" [nzMd]="8" class="mb-3">
                  <div class="plantao-card">
                    <div class="plantao-header">
                      <span class="plantao-data">28/05/2023</span>
                      <nz-tag nzColor="blue">12h</nz-tag>
                    </div>
                    <div class="plantao-content">
                      <h3>Hospital Santa Casa</h3>
                      <p>Setor: Emergência</p>
                      <p>Horário: 07:00 - 19:00</p>
                    </div>
                    <div class="plantao-footer">
                      <button nz-button nzType="link" nzSize="small" routerLink="/cliente/plantoes/detalhes/1">
                        <span nz-icon nzType="eye"></span> Detalhes
                      </button>
                    </div>
                  </div>
                </div>
                
                <div nz-col [nzXs]="24" [nzSm]="12" [nzMd]="8" class="mb-3">
                  <div class="plantao-card">
                    <div class="plantao-header">
                      <span class="plantao-data">15/05/2023</span>
                      <nz-tag nzColor="blue">6h</nz-tag>
                    </div>
                    <div class="plantao-content">
                      <h3>Hospital São Lucas</h3>
                      <p>Setor: UTI</p>
                      <p>Horário: 19:00 - 01:00</p>
                    </div>
                    <div class="plantao-footer">
                      <button nz-button nzType="link" nzSize="small" routerLink="/cliente/plantoes/detalhes/2">
                        <span nz-icon nzType="eye"></span> Detalhes
                      </button>
                    </div>
                  </div>
                </div>
                
                <div nz-col [nzXs]="24" [nzSm]="12" [nzMd]="8" class="mb-3">
                  <div class="plantao-card">
                    <div class="plantao-header">
                      <span class="plantao-data">10/05/2023</span>
                      <nz-tag nzColor="blue">8h</nz-tag>
                    </div>
                    <div class="plantao-content">
                      <h3>Hospital Regional</h3>
                      <p>Setor: Pediatria</p>
                      <p>Horário: 08:00 - 16:00</p>
                    </div>
                    <div class="plantao-footer">
                      <button nz-button nzType="link" nzSize="small" routerLink="/cliente/plantoes/detalhes/3">
                        <span nz-icon nzType="eye"></span> Detalhes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="view-calendar-button">
                <button nz-button nzType="default" routerLink="/cliente/plantoes/calendario">
                  <span nz-icon nzType="calendar"></span>
                  Ver Calendário
                </button>
              </div>
            </div>
          </nz-card>
        </ng-container>
      </div>
    </nz-content>
    
    <!-- Footer -->
    <nz-footer>Contabilidade App ©2023 - Todos os direitos reservados</nz-footer>
  `,
  styles: [`
    nz-content {
      margin: 24px;
    }
    
    .inner-content {
      padding: 24px;
      background: #fff;
      min-height: 100%;
    }
    
    nz-footer {
      text-align: center;
      color: rgba(0, 0, 0, 0.45);
    }
    
    .page-header {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #f0f0f0;
    }
    
    .page-header h1 {
      margin-bottom: 4px;
      font-size: 24px;
      font-weight: 500;
    }
    
    .page-header p {
      margin-bottom: 0;
      color: rgba(0, 0, 0, 0.45);
    }
    
    .mb-4 {
      margin-bottom: 16px;
    }
    
    .mb-3 {
      margin-bottom: 16px;
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .card-header h2 {
      margin-bottom: 0;
      font-size: 18px;
      font-weight: 500;
    }
    
    .card-actions {
      display: flex;
      gap: 8px;
    }
    
    .plantao-card {
      border: 1px solid #f0f0f0;
      border-radius: 4px;
      padding: 16px;
      height: 100%;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
      transition: all 0.3s;
    }
    
    .plantao-card:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    }
    
    .plantao-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    
    .plantao-data {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.65);
    }
    
    .plantao-content {
      margin-bottom: 12px;
    }
    
    .plantao-content h3 {
      margin-bottom: 8px;
      font-size: 16px;
      font-weight: 500;
    }
    
    .plantao-content p {
      margin-bottom: 4px;
      color: rgba(0, 0, 0, 0.65);
    }
    
    .plantao-footer {
      display: flex;
      justify-content: flex-end;
    }
    
    .view-calendar-button {
      display: flex;
      justify-content: center;
      margin-top: 16px;
    }
    
    /* Responsividade para dispositivos móveis */
    @media (max-width: 768px) {
      nz-content {
        margin: 16px;
      }
      
      .inner-content {
        padding: 16px;
      }
    }
    
    /* Responsividade para telas pequenas */
    @media (max-width: 576px) {
      .inner-content {
        padding: 16px;
      }
      
      .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
      
      .card-actions {
        width: 100%;
        flex-direction: column;
      }
      
      .card-actions button {
        width: 100%;
      }
      
      .page-header h1 {
        font-size: 20px;
      }
    }
    
    /* Responsividade para telas muito pequenas */
    @media (max-width: 400px) {
      nz-content {
        margin: 8px;
      }
      
      .inner-content {
        padding: 12px;
      }
      
      .page-header h1 {
        font-size: 18px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private authStore = inject(AuthStore);
  
  // Signals do AuthStore
  user = this.authStore.user;
  isContador = this.authStore.isContador;
  isCliente = this.authStore.isCliente;
  
  // Estatísticas para Contador
  contadorStats = {
    totalClientes: 42,
    documentosPendentes: 7,
    tarefasHoje: 5,
    declaracoesMes: 15
  };
  
  // Estatísticas para Cliente
  clienteStats = {
    documentosEnviados: 8,
    documentosPendentes: 2,
    horasPlantao: 12,
    proximaReuniao: '15/06'
  };
  
  // Atividades recentes
  atividadesRecentes = [
    { tipo: 'documento', descricao: 'Nota Fiscal 12345 enviada', data: '2023-06-01', status: 'enviado' },
    { tipo: 'reuniao', descricao: 'Reunião mensal agendada', data: '2023-06-15', status: 'agendado' },
    { tipo: 'plantao', descricao: 'Plantão registrado: Hospital Santa Casa', data: '2023-05-28', status: 'concluido' },
    { tipo: 'documento', descricao: 'Declaração de IR pendente', data: '2023-06-10', status: 'pendente' }
  ];
  
  // Clientes recentes (para contador)
  clientesRecentes = [
    { nome: 'João Silva', empresa: 'Silva Ltda', ultimoAcesso: '2023-06-01', documentosPendentes: 2 },
    { nome: 'Maria Oliveira', empresa: 'Oliveira ME', ultimoAcesso: '2023-05-28', documentosPendentes: 0 },
    { nome: 'Carlos Santos', empresa: 'Santos S.A.', ultimoAcesso: '2023-05-25', documentosPendentes: 5 }
  ];
  
  // Documentos recentes
  documentosRecentes = [
    { nome: 'Nota Fiscal 12345', tipo: 'NF-e', data: '2023-06-01', status: 'enviado' },
    { nome: 'Declaração IR 2023', tipo: 'IRPF', data: '2023-05-20', status: 'pendente' },
    { nome: 'Folha de Pagamento', tipo: 'RH', data: '2023-05-15', status: 'processado' }
  ];
  
  ngOnInit(): void {
    // Inicialização do componente
    // Aqui poderia ser feita a carga de dados reais do backend
  }
  
  /**
   * Retorna a cor do status para exibição nas tags
   * @param status - Status a ser verificado
   * @returns Cor correspondente ao status
   */
  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'enviado':
      case 'concluido':
      case 'processado':
        return 'green';
      case 'pendente':
        return 'orange';
      case 'agendado':
        return 'blue';
      case 'atrasado':
        return 'red';
      default:
        return 'default';
    }
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
} 