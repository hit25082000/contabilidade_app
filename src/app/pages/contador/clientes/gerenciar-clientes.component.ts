import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

// Serviços
import { ContadorClienteService } from '../../../core/services/contador-cliente.service';
import { AuthStore } from '../../../core/auth/service/auth.store';
import { IUser } from '../../../core/auth/models/user.interface';

// Componentes NG-ZORRO
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTagModule } from 'ng-zorro-antd/tag';

/**
 * Componente para gerenciar clientes do contador
 * Permite vincular e desvincular clientes
 */
@Component({
  selector: 'app-gerenciar-clientes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NzTableModule,
    NzDividerModule,
    NzButtonModule,
    NzIconModule,
    NzModalModule,
    NzMessageModule,
    NzSelectModule,
    NzSpinModule,
    NzEmptyModule,
    NzPopconfirmModule,
    NzBreadCrumbModule,
    NzInputModule,
    NzTagModule
  ],
  template: `
    <div class="container">
      <!-- Breadcrumb -->
      <nz-breadcrumb class="breadcrumb">
        <nz-breadcrumb-item>Home</nz-breadcrumb-item>
        <nz-breadcrumb-item>Contador</nz-breadcrumb-item>
        <nz-breadcrumb-item>Gerenciar Clientes</nz-breadcrumb-item>
      </nz-breadcrumb>

      <!-- Título da página -->
      <div class="page-header">
        <h1>Gerenciar Clientes</h1>
        <p>Vincule e gerencie seus clientes para facilitar o envio de documentos e acompanhamento.</p>
      </div>

      <!-- Barra de ações -->
      <div class="action-bar">
        <div class="search-box">
          <input 
            nz-input 
            placeholder="Buscar cliente..." 
            [(ngModel)]="searchText" 
            (ngModelChange)="filtrarClientes()"
          />
          <span nz-icon nzType="search"></span>
        </div>
        <button 
          nz-button 
          nzType="primary" 
          (click)="showModalVincularCliente()"
          [disabled]="carregandoDisponiveis()"
        >
          <span nz-icon nzType="user-add"></span>
          Vincular Novo Cliente
        </button>
      </div>

      <!-- Tabela de clientes -->
      <nz-spin [nzSpinning]="carregando()">
        <nz-table 
          #clientesTable 
          [nzData]="clientesFiltrados()" 
          [nzPageSize]="10"
          [nzShowSizeChanger]="true"
          [nzPageSizeOptions]="[5, 10, 20, 50]"
          [nzLoading]="carregando()"
          [nzShowTotal]="totalTemplate"
        >
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>CPF/CNPJ</th>
              <th>Empresa</th>
              <th>Telefone</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let cliente of clientesTable.data">
              <td>{{ cliente.nome_completo }}</td>
              <td>{{ cliente.email }}</td>
              <td>{{ formatarCpfCnpj(cliente.cpf_cnpj) }}</td>
              <td>{{ cliente.metadata?.empresa || '-' }}</td>
              <td>{{ cliente.telefone || '-' }}</td>
              <td>
                <button 
                  nz-button 
                  nzType="primary" 
                  nzSize="small" 
                  routerLink="/contador/clientes/{{ cliente.id }}"
                >
                  <span nz-icon nzType="eye"></span>
                </button>
                <nz-divider nzType="vertical"></nz-divider>
                <button 
                  nz-button 
                  nzType="default" 
                  nzSize="small" 
                  routerLink="/contador/clientes/{{ cliente.id }}/documentos"
                >
                  <span nz-icon nzType="file-text"></span>
                </button>
                <nz-divider nzType="vertical"></nz-divider>
                <button 
                  nz-button 
                  nzType="default" 
                  nzDanger
                  nzSize="small"
                  nz-popconfirm
                  nzPopconfirmTitle="Tem certeza que deseja desvincular este cliente?"
                  nzPopconfirmPlacement="top"
                  (nzOnConfirm)="desvincularCliente(cliente.id)"
                >
                  <span nz-icon nzType="disconnect"></span>
                </button>
              </td>
            </tr>
          </tbody>
          <ng-template #totalTemplate let-total>
            Total: {{ total }} cliente(s)
          </ng-template>
        </nz-table>

        <!-- Mensagem quando não há clientes -->
        <nz-empty 
          *ngIf="clientes().length === 0 && !carregando()" 
          nzNotFoundContent="Nenhum cliente vinculado encontrado"
          [nzNotFoundFooter]="emptyFooter"
        >
          <ng-template #emptyFooter>
            <button nz-button nzType="primary" (click)="showModalVincularCliente()">
              <span nz-icon nzType="user-add"></span>
              Vincular Novo Cliente
            </button>
          </ng-template>
        </nz-empty>
      </nz-spin>

      <!-- Modal para vincular cliente -->
      <nz-modal
        [(nzVisible)]="modalVincularVisible"
        nzTitle="Vincular Novo Cliente"
        (nzOnCancel)="handleCancelModal()"
        [nzFooter]="modalFooter"
      >
        <ng-container *nzModalContent>
          <nz-spin [nzSpinning]="carregandoDisponiveis()">
            <div *ngIf="clientesDisponiveis().length > 0; else semClientesDisponiveis">
              <p>Selecione um cliente para vincular:</p>
              <nz-select
                style="width: 100%"
                nzShowSearch
                nzAllowClear
                nzPlaceHolder="Selecione um cliente"
                [(ngModel)]="clienteSelecionadoId"
              >
                <nz-option
                  *ngFor="let cliente of clientesDisponiveis()"
                  [nzValue]="cliente.id"
                  [nzLabel]="cliente.nome_completo + ' (' + cliente.email + ')'"
                ></nz-option>
              </nz-select>
            </div>
            <ng-template #semClientesDisponiveis>
              <nz-empty 
                nzNotFoundContent="Não há clientes disponíveis para vincular"
                [nzNotFoundFooter]="emptyModalFooter"
              >
                <ng-template #emptyModalFooter>
                  <p>Todos os clientes já estão vinculados ou não existem clientes cadastrados.</p>
                </ng-template>
              </nz-empty>
            </ng-template>
          </nz-spin>
        </ng-container>
        <ng-template #modalFooter>
          <button nz-button nzType="default" (click)="handleCancelModal()">Cancelar</button>
          <button 
            nz-button 
            nzType="primary" 
            (click)="vincularCliente()"
            [disabled]="!clienteSelecionadoId || carregandoDisponiveis()"
          >
            Vincular
          </button>
        </ng-template>
      </nz-modal>
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

    .action-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .search-box {
      position: relative;
      width: 300px;
    }

    .search-box input {
      padding-right: 30px;
    }

    .search-box span[nz-icon] {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(0, 0, 0, 0.45);
    }

    /* Responsividade */
    @media (max-width: 768px) {
      .action-bar {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .search-box {
        width: 100%;
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
      :host ::ng-deep .ant-table-thead > tr > th:nth-child(4),
      :host ::ng-deep .ant-table-tbody > tr > td:nth-child(4),
      :host ::ng-deep .ant-table-thead > tr > th:nth-child(5),
      :host ::ng-deep .ant-table-tbody > tr > td:nth-child(5) {
        display: none;
      }
    }
  `]
})
export class GerenciarClientesComponent implements OnInit {
  // Injeção de dependências
  private contadorClienteService = inject(ContadorClienteService);
  private authStore = inject(AuthStore);
  private messageService = inject(NzMessageService);

  // Signals
  clientes = signal<IUser[]>([]);
  clientesFiltrados = signal<IUser[]>([]);
  clientesDisponiveis = signal<IUser[]>([]);
  carregando = signal<boolean>(false);
  carregandoDisponiveis = signal<boolean>(false);

  // Estado do componente
  searchText = '';
  modalVincularVisible = false;
  clienteSelecionadoId = '';

  ngOnInit(): void {
    this.carregarClientes();
  }

  /**
   * Carrega os clientes vinculados ao contador
   */
  async carregarClientes(): Promise<void> {
    try {
      this.carregando.set(true);
      const contadorId = this.authStore.user()?.id;
      
      if (!contadorId) {
        this.messageService.error('Usuário não identificado');
        return;
      }

      const clientesData = await this.contadorClienteService.getClientesByContador(contadorId);
      this.clientes.set(clientesData);
      this.clientesFiltrados.set(clientesData);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      this.messageService.error('Erro ao carregar clientes');
    } finally {
      this.carregando.set(false);
    }
  }

  /**
   * Carrega os clientes disponíveis para vinculação
   */
  async carregarClientesDisponiveis(): Promise<void> {
    try {
      this.carregandoDisponiveis.set(true);
      const contadorId = this.authStore.user()?.id;
      
      if (!contadorId) {
        this.messageService.error('Usuário não identificado');
        return;
      }

      const clientesDisponiveisData = await this.contadorClienteService.getClientesDisponiveis(contadorId);
      this.clientesDisponiveis.set(clientesDisponiveisData);
    } catch (error) {
      console.error('Erro ao carregar clientes disponíveis:', error);
      this.messageService.error('Erro ao carregar clientes disponíveis');
    } finally {
      this.carregandoDisponiveis.set(false);
    }
  }

  /**
   * Filtra os clientes com base no texto de busca
   */
  filtrarClientes(): void {
    if (!this.searchText) {
      this.clientesFiltrados.set(this.clientes());
      return;
    }

    const searchLower = this.searchText.toLowerCase();
    const filtered = this.clientes().filter(cliente => 
      cliente.nome_completo.toLowerCase().includes(searchLower) ||
      cliente.email.toLowerCase().includes(searchLower) ||
      cliente.cpf_cnpj.toLowerCase().includes(searchLower) ||
      (cliente.metadata?.empresa && cliente.metadata.empresa.toLowerCase().includes(searchLower))
    );
    
    this.clientesFiltrados.set(filtered);
  }

  /**
   * Exibe o modal para vincular um novo cliente
   */
  showModalVincularCliente(): void {
    this.modalVincularVisible = true;
    this.clienteSelecionadoId = '';
    this.carregarClientesDisponiveis();
  }

  /**
   * Fecha o modal de vincular cliente
   */
  handleCancelModal(): void {
    this.modalVincularVisible = false;
  }

  /**
   * Vincula um cliente ao contador
   */
  async vincularCliente(): Promise<void> {
    if (!this.clienteSelecionadoId) {
      this.messageService.warning('Selecione um cliente para vincular');
      return;
    }

    try {
      const contadorId = this.authStore.user()?.id;
      
      if (!contadorId) {
        this.messageService.error('Usuário não identificado');
        return;
      }

      await this.contadorClienteService.vincularCliente(contadorId, this.clienteSelecionadoId);
      this.messageService.success('Cliente vinculado com sucesso');
      this.modalVincularVisible = false;
      this.carregarClientes();
    } catch (error) {
      console.error('Erro ao vincular cliente:', error);
      this.messageService.error('Erro ao vincular cliente');
    }
  }

  /**
   * Desvincula um cliente do contador
   * @param clienteId - ID do cliente a ser desvinculado
   */
  async desvincularCliente(clienteId: string): Promise<void> {
    try {
      const contadorId = this.authStore.user()?.id;
      
      if (!contadorId) {
        this.messageService.error('Usuário não identificado');
        return;
      }

      await this.contadorClienteService.desvincularCliente(contadorId, clienteId);
      this.messageService.success('Cliente desvinculado com sucesso');
      this.carregarClientes();
    } catch (error) {
      console.error('Erro ao desvincular cliente:', error);
      this.messageService.error('Erro ao desvincular cliente');
    }
  }

  /**
   * Formata o CPF/CNPJ para exibição
   * @param cpfCnpj - CPF ou CNPJ a ser formatado
   * @returns CPF/CNPJ formatado
   */
  formatarCpfCnpj(cpfCnpj: string): string {
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
} 