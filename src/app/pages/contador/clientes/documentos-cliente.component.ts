import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatabaseService } from '../../../core/services/database.service';
import { IUser } from '../../../core/auth/models/user.interface';

// Componentes NG-ZORRO
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzUploadModule } from 'ng-zorro-antd/upload';

/**
 * Interface para documentos
 */
interface IDocumento {
  id: string;
  nome: string;
  tipo: string;
  data: string;
  status: string;
  tamanho: string;
  url?: string;
}

/**
 * Componente para exibir documentos de um cliente específico
 */
@Component({
  selector: 'app-documentos-cliente',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NzCardModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzSpinModule,
    NzMessageModule,
    NzBreadCrumbModule,
    NzDividerModule,
    NzTagModule,
    NzEmptyModule,
    NzUploadModule
  ],
  template: `
    <div class="container">
      <!-- Breadcrumb -->
      <nz-breadcrumb class="breadcrumb">
        <nz-breadcrumb-item>Home</nz-breadcrumb-item>
        <nz-breadcrumb-item>Contador</nz-breadcrumb-item>
        <nz-breadcrumb-item routerLink="/contador/clientes">Clientes</nz-breadcrumb-item>
        <nz-breadcrumb-item routerLink="/contador/clientes/{{ clienteId }}">Detalhes do Cliente</nz-breadcrumb-item>
        <nz-breadcrumb-item>Documentos</nz-breadcrumb-item>
      </nz-breadcrumb>

      <!-- Título da página -->
      <div class="page-header">
        <h1>Documentos do Cliente</h1>
        <p *ngIf="cliente()">Documentos de {{ cliente()?.nome_completo }}</p>
      </div>

      <!-- Conteúdo principal -->
      <nz-spin [nzSpinning]="carregando()">
        <div *ngIf="cliente(); else semCliente">
          <nz-card>
            <div class="card-header">
              <h2>Documentos</h2>
              <div class="card-actions">
                <button 
                  nz-button 
                  nzType="primary" 
                >
                  <span nz-icon nzType="upload"></span>
                  Enviar Documento
                </button>
                <button 
                  nz-button 
                  nzType="default" 
                  routerLink="/contador/clientes/{{ clienteId }}"
                >
                  <span nz-icon nzType="arrow-left"></span>
                  Voltar
                </button>
              </div>
            </div>

            <nz-divider></nz-divider>

            <!-- Tabela de documentos -->
            <nz-table 
              #documentosTable 
              [nzData]="documentos()" 
              [nzPageSize]="10"
              [nzShowSizeChanger]="true"
              [nzPageSizeOptions]="[5, 10, 20, 50]"
              [nzLoading]="carregandoDocumentos()"
            >
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Data</th>
                  <th>Tamanho</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let documento of documentosTable.data">
                  <td>{{ documento.nome }}</td>
                  <td>{{ documento.tipo }}</td>
                  <td>{{ formatarData(documento.data) }}</td>
                  <td>{{ documento.tamanho }}</td>
                  <td>
                    <nz-tag [nzColor]="getStatusColor(documento.status)">
                      {{ documento.status }}
                    </nz-tag>
                  </td>
                  <td>
                    <button 
                      nz-button 
                      nzType="primary" 
                      nzSize="small" 
                      [disabled]="!documento.url"
                      (click)="visualizarDocumento(documento)"
                    >
                      <span nz-icon nzType="eye"></span>
                    </button>
                    <nz-divider nzType="vertical"></nz-divider>
                    <button 
                      nz-button 
                      nzType="default" 
                      nzSize="small" 
                      [disabled]="!documento.url"
                      (click)="baixarDocumento(documento)"
                    >
                      <span nz-icon nzType="download"></span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </nz-table>

            <!-- Mensagem quando não há documentos -->
            <nz-empty 
              *ngIf="documentos().length === 0 && !carregandoDocumentos()" 
              nzNotFoundContent="Nenhum documento encontrado para este cliente"
              [nzNotFoundFooter]="emptyFooter"
            >
              <ng-template #emptyFooter>
                <button nz-button nzType="primary">
                  <span nz-icon nzType="upload"></span>
                  Enviar Documento
                </button>
              </ng-template>
            </nz-empty>
          </nz-card>
        </div>

        <ng-template #semCliente>
          <nz-card *ngIf="!carregando()">
            <div class="empty-state">
              <span nz-icon nzType="user" nzTheme="outline" style="font-size: 48px;"></span>
              <h3>Cliente não encontrado</h3>
              <p>O cliente solicitado não foi encontrado ou você não tem permissão para acessá-lo.</p>
              <button nz-button nzType="primary" routerLink="/contador/clientes">
                <span nz-icon nzType="arrow-left"></span>
                Voltar para Lista de Clientes
              </button>
            </div>
          </nz-card>
        </ng-template>
      </nz-spin>
    </div>
  `,
  styles: [`
    .container {
      padding: 24px;
      background: #fff;
      min-height: 100%;
    }

    .breadcrumb {
      margin-bottom: 16px;
    }

    .page-header {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #f0f0f0;
    }

    .page-header h1 {
      margin-bottom: 8px;
      font-size: 24px;
      font-weight: 500;
    }

    .page-header p {
      margin-bottom: 0;
      color: rgba(0, 0, 0, 0.65);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .card-header h2 {
      margin-bottom: 0;
      font-size: 20px;
      font-weight: 500;
    }

    .card-actions {
      display: flex;
      gap: 8px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 0;
      text-align: center;
    }

    .empty-state h3 {
      margin: 16px 0 8px;
      font-size: 18px;
      font-weight: 500;
    }

    .empty-state p {
      margin-bottom: 24px;
      color: rgba(0, 0, 0, 0.45);
    }

    /* Responsividade */
    @media (max-width: 768px) {
      .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .card-actions {
        width: 100%;
      }

      .card-actions button {
        flex: 1;
      }
    }

    @media (max-width: 576px) {
      .container {
        padding: 16px;
      }

      .page-header h1 {
        font-size: 20px;
      }
    }

    @media (max-width: 400px) {
      .container {
        padding: 12px;
      }

      :host ::ng-deep .ant-table {
        overflow-x: auto;
      }

      :host ::ng-deep .ant-table-thead > tr > th,
      :host ::ng-deep .ant-table-tbody > tr > td {
        white-space: nowrap;
        padding: 8px 4px;
        font-size: 12px;
      }

      /* Esconde colunas menos importantes em telas pequenas */
      :host ::ng-deep .ant-table-thead > tr > th:nth-child(2),
      :host ::ng-deep .ant-table-tbody > tr > td:nth-child(2),
      :host ::ng-deep .ant-table-thead > tr > th:nth-child(4),
      :host ::ng-deep .ant-table-tbody > tr > td:nth-child(4) {
        display: none;
      }
    }
  `]
})
export class DocumentosClienteComponent implements OnInit {
  // Injeção de dependências
  private route = inject(ActivatedRoute);
  private databaseService = inject(DatabaseService);
  private messageService = inject(NzMessageService);

  // Signals
  cliente = signal<IUser | null>(null);
  documentos = signal<IDocumento[]>([]);
  carregando = signal<boolean>(false);
  carregandoDocumentos = signal<boolean>(false);

  // Propriedades
  clienteId = '';

  ngOnInit(): void {
    this.clienteId = this.route.snapshot.paramMap.get('id') || '';
    this.carregarCliente();
    this.carregarDocumentos();
  }

  /**
   * Carrega os dados do cliente
   */
  async carregarCliente(): Promise<void> {
    try {
      this.carregando.set(true);
      
      if (!this.clienteId) {
        this.messageService.error('ID do cliente não fornecido');
        return;
      }

      const clienteData = await this.databaseService.getUserProfile(this.clienteId);
      
      if (clienteData.error) {
        throw clienteData.error;
      }
      
      this.cliente.set(clienteData.data);
    } catch (error) {
      console.error('Erro ao carregar cliente:', error);
      this.messageService.error('Erro ao carregar dados do cliente');
    } finally {
      this.carregando.set(false);
    }
  }

  /**
   * Carrega os documentos do cliente
   * Nota: Esta é uma implementação simulada, deve ser substituída pela implementação real
   */
  async carregarDocumentos(): Promise<void> {
    try {
      this.carregandoDocumentos.set(true);
      
      // Simulação de dados - deve ser substituída pela chamada real à API
      // Aguarda 1 segundo para simular o carregamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dados simulados
      const documentosSimulados: IDocumento[] = [
        {
          id: '1',
          nome: 'Nota Fiscal 12345',
          tipo: 'NF-e',
          data: '2023-06-01',
          status: 'enviado',
          tamanho: '1.2 MB',
          url: '#'
        },
        {
          id: '2',
          nome: 'Declaração IR 2023',
          tipo: 'IRPF',
          data: '2023-05-20',
          status: 'pendente',
          tamanho: '3.5 MB',
          url: '#'
        },
        {
          id: '3',
          nome: 'Folha de Pagamento',
          tipo: 'RH',
          data: '2023-05-15',
          status: 'processado',
          tamanho: '0.8 MB',
          url: '#'
        }
      ];
      
      this.documentos.set(documentosSimulados);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      this.messageService.error('Erro ao carregar documentos do cliente');
    } finally {
      this.carregandoDocumentos.set(false);
    }
  }

  /**
   * Visualiza um documento
   * @param documento - Documento a ser visualizado
   */
  visualizarDocumento(documento: IDocumento): void {
    // Implementação simulada - deve ser substituída pela implementação real
    this.messageService.info(`Visualizando documento: ${documento.nome}`);
    
    if (documento.url) {
      window.open(documento.url, '_blank');
    }
  }

  /**
   * Baixa um documento
   * @param documento - Documento a ser baixado
   */
  baixarDocumento(documento: IDocumento): void {
    // Implementação simulada - deve ser substituída pela implementação real
    this.messageService.success(`Documento baixado: ${documento.nome}`);
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
    if (!dataString) return '-';
    
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  }
} 