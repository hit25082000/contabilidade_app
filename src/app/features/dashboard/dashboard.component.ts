import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../core/store/auth.store';

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
                <td>{{ atividade.data }}</td>
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
                  <th>CPF/CNPJ</th>
                  <th>Último Acesso</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let cliente of clientesTable.data">
                  <td>{{ cliente.nome }}</td>
                  <td>{{ cliente.cpfCnpj }}</td>
                  <td>{{ cliente.ultimoAcesso }}</td>
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
          <nz-card class="mb-4">
            <div class="card-header">
              <h2>Documentos Recentes</h2>
              <button nz-button nzType="link">Ver todos</button>
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
                  <td>{{ documento.data }}</td>
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
    
    /* Responsividade para dispositivos móveis */
    @media (max-width: 768px) {
      nz-content {
        margin: 16px;
      }
      
      .inner-content {
        padding: 16px;
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
        font-size: 20px;
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
    { data: '10/06/2023', descricao: 'Documento fiscal enviado', status: 'Concluído' },
    { data: '08/06/2023', descricao: 'Reunião com cliente', status: 'Agendado' },
    { data: '05/06/2023', descricao: 'Declaração de imposto', status: 'Pendente' }
  ];
  
  // Clientes recentes (para Contador)
  clientesRecentes = [
    { nome: 'Empresa ABC Ltda', cpfCnpj: '12.345.678/0001-90', ultimoAcesso: '10/06/2023' },
    { nome: 'João Silva ME', cpfCnpj: '98.765.432/0001-21', ultimoAcesso: '09/06/2023' },
    { nome: 'Maria Oliveira', cpfCnpj: '123.456.789-00', ultimoAcesso: '08/06/2023' }
  ];
  
  // Documentos recentes (para Cliente)
  documentosRecentes = [
    { nome: 'Nota Fiscal 12345', tipo: 'NF-e', data: '10/06/2023', status: 'Processado' },
    { nome: 'Recibo de Pagamento', tipo: 'Recibo', data: '08/06/2023', status: 'Pendente' },
    { nome: 'Extrato Bancário', tipo: 'Extrato', data: '05/06/2023', status: 'Enviado' }
  ];
  
  ngOnInit(): void {
    // Inicialização do componente
    // Aqui poderia ser feita a carga de dados reais do backend
  }
  
  /**
   * Retorna a cor do status para as tags
   * @param status - Status da atividade ou documento
   * @returns string com o código de cor
   */
  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'concluído':
      case 'processado':
        return 'success';
      case 'pendente':
        return 'warning';
      case 'agendado':
        return 'processing';
      case 'enviado':
        return 'blue';
      default:
        return 'default';
    }
  }
} 