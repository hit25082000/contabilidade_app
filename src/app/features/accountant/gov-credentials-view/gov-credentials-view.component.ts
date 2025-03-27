import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { GovCredentialsHelpComponent } from '../../../shared/components/gov-credentials-help/gov-credentials-help.component';
import { GovCredentialsService } from '../../../core/services/gov-credentials.service';
import { IGovCredentials } from '../../../core/models/gov-credentials.model';

// Importações do NG-ZORRO
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTagModule } from 'ng-zorro-antd/tag';

/**
 * Componente para visualização de credenciais governamentais por contadores
 * Permite ao contador visualizar as credenciais compartilhadas pelos clientes
 */
@Component({
  selector: 'app-gov-credentials-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    GovCredentialsHelpComponent,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzEmptyModule,
    NzCardModule,
    NzCollapseModule,
    NzModalModule,
    NzSpinModule,
    NzAlertModule,
    NzPopconfirmModule,
    NzTagModule
  ],
  template: `
    <div class="credentials-view-container">
      <div class="page-header">
        <h2>Credenciais Governamentais dos Clientes</h2>
        
        <!-- Componente de ajuda -->
        <app-gov-credentials-help contextType="contador"></app-gov-credentials-help>
      </div>
      
      <nz-alert 
        *ngIf="errorMessage()" 
        nzType="error" 
        [nzMessage]="errorMessage()" 
        nzShowIcon>
      </nz-alert>
      
      <nz-spin [nzSpinning]="isLoading()">
        <div *ngIf="!isLoading() && credentialsByClient().length === 0" class="empty-state">
          <nz-empty 
            nzNotFoundImage="simple" 
            nzNotFoundContent="Nenhum cliente compartilhou credenciais governamentais ainda">
          </nz-empty>
        </div>
        
        <div *ngIf="credentialsByClient().length > 0">
          <nz-card 
            *ngFor="let clientGroup of credentialsByClient()" 
            class="client-card"
            [nzTitle]="clientGroup.clientName">
            
            <nz-table
              #credentialsTable
              [nzData]="clientGroup.credentials"
              [nzPageSize]="5"
              [nzShowPagination]="clientGroup.credentials.length > 5">
              <thead>
                <tr>
                  <th>Nome da Credencial</th>
                  <th>Sistema</th>
                  <th>Atualizada</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let credential of credentialsTable.data">
                  <td>{{ credential.credential_name }}</td>
                  <td>{{ getCredentialType(credential) }}</td>
                  <td>{{ credential.updated_at | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td>
                    <button 
                      nz-button 
                      nzType="primary" 
                      nzShape="circle"
                      nz-popconfirm
                      nzPopconfirmTitle="Visualizar esta credencial? O acesso será registrado."
                      nzPopconfirmPlacement="top"
                      (nzOnConfirm)="viewCredential(credential)">
                      <span nz-icon nzType="eye"></span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </nz-table>
          </nz-card>
        </div>
      </nz-spin>
    </div>
  `,
  styles: [`
    .credentials-view-container {
      padding: 16px;
    }
    
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .empty-state {
      background: #fafafa;
      padding: 32px;
      border-radius: 4px;
      text-align: center;
    }
    
    .client-card {
      margin-bottom: 16px;
    }
    
    .client-card ::ng-deep .ant-card-head-title {
      font-weight: 500;
    }
    
    /* Ajustes para telas pequenas */
    @media (max-width: 480px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
      
      h2 {
        margin-bottom: 0;
      }
    }
  `]
})
export class GovCredentialsViewComponent implements OnInit {
  private govCredentialsService = inject(GovCredentialsService);
  private modalService = inject(NzModalService);
  
  // Signals
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  credentialsByClient = signal<ClientCredentialGroup[]>([]);
  
  ngOnInit(): void {
    this.carregarCredenciais();
  }
  
  /**
   * Carrega todas as credenciais disponíveis para o contador
   */
  carregarCredenciais(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    
    // ID temporário para simulação/desenvolvimento
    const contadorId = '123e4567-e89b-12d3-a456-426614174000';
    
    // Usamos o método com Observable que retorna da mesma forma que outros métodos Angular
    this.govCredentialsService.getCredentialsForContadorAsObservable(contadorId)
      .subscribe({
        next: (credenciais) => {
          // Agrupar credenciais por cliente
          const groupedByClient = this.groupCredentialsByClient(credenciais);
          this.credentialsByClient.set(groupedByClient);
          this.isLoading.set(false);
        },
        error: (error: any) => {
          console.error('Erro ao carregar credenciais:', error);
          this.errorMessage.set('Não foi possível carregar as credenciais. Tente novamente mais tarde.');
          this.isLoading.set(false);
        }
      });
  }
  
  /**
   * Agrupa credenciais por cliente
   */
  private groupCredentialsByClient(credenciais: IGovCredentials[]): ClientCredentialGroup[] {
    const groups: Record<string, ClientCredentialGroup> = {};
    
    // Simula agrupamento - em produção, isso viria do backend
    credenciais.forEach(credential => {
      const clientId = credential.cliente_id;
      
      if (!groups[clientId]) {
        // Extrair nome do cliente dos metadados da primeira credencial
        // Em produção, teria uma API para obter o nome do cliente
        const clientName = `Cliente ${clientId.substring(0, 6)}`;
        
        groups[clientId] = {
          clientId,
          clientName,
          credentials: []
        };
      }
      
      groups[clientId].credentials.push(credential);
    });
    
    return Object.values(groups);
  }
  
  /**
   * Extrai o tipo de credencial a partir do nome
   */
  getCredentialType(credential: IGovCredentials): string {
    // Tenta identificar o tipo pelo nome da credencial
    const name = credential.credential_name.toUpperCase();
    
    if (name.includes('ECAC') || name.includes('E-CAC')) return 'e-CAC';
    if (name.includes('ESOCIAL') || name.includes('E-SOCIAL')) return 'e-Social';
    if (name.includes('CONECTIVIDADE')) return 'Conectividade Social';
    if (name.includes('SIMPLES') || name.includes('PGDAS')) return 'Simples Nacional';
    if (name.includes('GOV.BR') || name.includes('GOVBR')) return 'Gov.BR';
    
    return 'Outro';
  }
  
  /**
   * Visualiza os detalhes de uma credencial
   */
  viewCredential(credential: IGovCredentials): void {
    // Como o método requer o ID do contador, adicionamos um ID temporário
    const contadorId = '123e4567-e89b-12d3-a456-426614174000';
    
    this.govCredentialsService.decryptCredentialAsObservable(credential.id || '', contadorId)
      .subscribe({
        next: (decryptedCredential) => {
          this.modalService.info({
            nzTitle: `Credencial: ${credential.credential_name}`,
            nzWidth: '500px',
            nzContent: this.getCredentialDetailsTemplate(decryptedCredential),
            nzOkText: 'Fechar'
          });
        },
        error: (error: any) => {
          console.error('Erro ao descriptografar credencial:', error);
          this.modalService.error({
            nzTitle: 'Erro ao acessar credencial',
            nzContent: 'Não foi possível descriptografar a credencial. Tente novamente mais tarde.'
          });
        }
      });
  }
  
  /**
   * Gera o template HTML para exibir os detalhes da credencial
   */
  private getCredentialDetailsTemplate(credential: any): string {
    const fields = Object.entries(credential)
      .filter(([key]) => !['id', 'cliente_id', 'contador_id', 'created_at', 'updated_at', 'is_active', 'access_log'].includes(key))
      .map(([key, value]) => {
        const label = this.formatFieldLabel(key);
        return `
          <div class="credential-field">
            <strong>${label}:</strong>
            <span>${value || 'Não informado'}</span>
          </div>
        `;
      })
      .join('');
    
    return `
      <div class="credential-details">
        <p class="credential-note">
          <span nz-icon nzType="info-circle" nzTheme="outline"></span>
          Este acesso foi registrado e o cliente pode visualizar o histórico.
        </p>
        ${fields}
      </div>
      <style>
        .credential-details {
          max-height: 400px;
          overflow-y: auto;
        }
        .credential-field {
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .credential-note {
          background-color: #e6f7ff;
          border-radius: 4px;
          padding: 8px 12px;
          margin-bottom: 16px;
          font-size: 14px;
          color: #1890ff;
        }
      </style>
    `;
  }
  
  /**
   * Formata o nome do campo para exibição
   */
  private formatFieldLabel(key: string): string {
    const labelMap: Record<string, string> = {
      'credential_name': 'Nome da Credencial',
      'credential_type': 'Tipo de Sistema',
      'username': 'Usuário',
      'password': 'Senha',
      'certificate': 'Certificado',
      'notes': 'Observações',
      'portal_url': 'URL do Portal',
      'additional_info': 'Informações Adicionais'
    };
    
    return labelMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}

/**
 * Interface para agrupar credenciais por cliente
 */
interface ClientCredentialGroup {
  clientId: string;
  clientName: string;
  credentials: IGovCredentials[];
} 