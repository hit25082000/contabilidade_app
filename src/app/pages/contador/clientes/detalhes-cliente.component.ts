import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatabaseService } from '../../../core/services/database.service';
import { IUser } from '../../../core/auth/models/user.interface';

// Componentes NG-ZORRO
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTagModule } from 'ng-zorro-antd/tag';

/**
 * Componente para exibir detalhes de um cliente específico
 */
@Component({
  selector: 'app-detalhes-cliente',
  imports: [
    CommonModule,
    RouterLink,
    NzCardModule,
    NzDescriptionsModule,
    NzButtonModule,
    NzIconModule,
    NzSpinModule,
    NzMessageModule,
    NzBreadCrumbModule,
    NzDividerModule,
    NzTagModule
  ],
  template: `
    <div class="container">
      <!-- Breadcrumb -->
      <nz-breadcrumb class="breadcrumb">
        <nz-breadcrumb-item>Home</nz-breadcrumb-item>
        <nz-breadcrumb-item>Contador</nz-breadcrumb-item>
        <nz-breadcrumb-item routerLink="/contador/clientes">Clientes</nz-breadcrumb-item>
        <nz-breadcrumb-item>Detalhes do Cliente</nz-breadcrumb-item>
      </nz-breadcrumb>

      <!-- Título da página -->
      <div class="page-header">
        <h1>Detalhes do Cliente</h1>
        <p>Informações detalhadas do cliente selecionado.</p>
      </div>

      <!-- Conteúdo principal -->
      <nz-spin [nzSpinning]="carregando()">
        <div *ngIf="cliente(); else semCliente">
          <nz-card>
            <div class="card-header">
              <h2>{{ cliente()?.nome_completo }}</h2>
              <div class="card-actions">
                <button 
                  nz-button 
                  nzType="primary" 
                  routerLink="/contador/clientes/{{ cliente()?.id }}/documentos"
                >
                  <span nz-icon nzType="file-text"></span>
                  Documentos
                </button>
                <button 
                  nz-button 
                  nzType="default" 
                  routerLink="/contador/clientes"
                >
                  <span nz-icon nzType="arrow-left"></span>
                  Voltar
                </button>
              </div>
            </div>

            <nz-divider></nz-divider>

            <nz-descriptions nzTitle="Informações Pessoais" [nzColumn]="{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }">
              <nz-descriptions-item nzTitle="Nome Completo">
                {{ cliente()?.nome_completo }}
              </nz-descriptions-item>
              <nz-descriptions-item nzTitle="E-mail">
                {{ cliente()?.email }}
              </nz-descriptions-item>
              <nz-descriptions-item nzTitle="CPF/CNPJ">
                {{ formatarCpfCnpj(cliente()?.cpf_cnpj) }}
              </nz-descriptions-item>
              <nz-descriptions-item nzTitle="Telefone">
                {{ cliente()?.telefone || '-' }}
              </nz-descriptions-item>
              <nz-descriptions-item nzTitle="Empresa">
                {{ cliente()?.metadata?.empresa || '-' }}
              </nz-descriptions-item>
              <nz-descriptions-item nzTitle="Cargo">
                {{ cliente()?.metadata?.cargo || '-' }}
              </nz-descriptions-item>
              <nz-descriptions-item nzTitle="Data de Cadastro">
                {{ formatarData(cliente()?.created_at) }}
              </nz-descriptions-item>
              <nz-descriptions-item nzTitle="Último Acesso">
                {{ cliente()?.last_sign_in_at ? formatarData(cliente()?.last_sign_in_at) : '-' }}
              </nz-descriptions-item>
            </nz-descriptions>
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
    }
  `]
})
export class DetalhesClienteComponent implements OnInit {
  // Injeção de dependências
  private route = inject(ActivatedRoute);
  private databaseService = inject(DatabaseService);
  private messageService = inject(NzMessageService);

  // Signals
  cliente = signal<IUser | null>(null);
  carregando = signal<boolean>(false);

  ngOnInit(): void {
    this.carregarCliente();
  }

  /**
   * Carrega os dados do cliente
   */
  async carregarCliente(): Promise<void> {
    try {
      this.carregando.set(true);
      const clienteId = this.route.snapshot.paramMap.get('id');
      
      if (!clienteId) {
        this.messageService.error('ID do cliente não fornecido');
        return;
      }

      const clienteData = await this.databaseService.getUserProfile(clienteId);
      
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
   * Formata o CPF/CNPJ para exibição
   * @param cpfCnpj - CPF ou CNPJ a ser formatado
   * @returns CPF/CNPJ formatado
   */
  formatarCpfCnpj(cpfCnpj?: string): string {
    if (!cpfCnpj) return '-';
    
    // Remove caracteres não numéricos
    const numeros = cpfCnpj.replace(/\D/g, '');
    
    // Formata como CPF (11 dígitos)
    if (numeros.length === 11) {
      return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    // Formata como CNPJ (14 dígitos)
    if (numeros.length === 14) {
      return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    
    // Retorna sem formatação se não for CPF nem CNPJ
    return cpfCnpj;
  }

  /**
   * Formata a data para exibição
   * @param dataString - Data em formato ISO
   * @returns Data formatada
   */
  formatarData(dataString?: string): string {
    if (!dataString) return '-';
    
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  }
} 