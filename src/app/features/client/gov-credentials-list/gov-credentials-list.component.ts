import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GovCredentialsService } from '../../../core/services/gov-credentials.service';
import { IGovCredentials } from '../../../core/models/gov-credentials.model';
import { GovCredentialsHelpComponent } from '../../../shared/components/gov-credentials-help/gov-credentials-help.component';
import { AuthStore } from '../../../core/auth/service/auth.store';

/**
 * Componente que lista as credenciais governamentais do cliente
 * Permite adicionar, editar e revogar credenciais
 */
@Component({
  selector: 'app-gov-credentials-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    GovCredentialsHelpComponent
  ],
  template: `
    <div class="credentials-container">
      <div class="page-header">
        <h2>Minhas Credenciais Governamentais</h2>
        <div class="actions">
          <button nz-button nzType="primary" routerLink="nova">
            <span nz-icon nzType="plus" nzTheme="outline"></span>
            Nova Credencial
          </button>
        </div>
      </div>

      <!-- Componente de ajuda -->
      <app-gov-credentials-help contextType="list"></app-gov-credentials-help>

      <div class="info-box" *ngIf="!isLoading && credentials.length === 0">
        <p>
          <strong>Você ainda não cadastrou credenciais.</strong>
        </p>
        <p>
          Compartilhe suas credenciais de acesso a portais governamentais de forma segura com seu contador.
          Todas as informações são criptografadas e só podem ser acessadas pelo seu contador autorizado.
        </p>
      </div>
      
      <div class="loading-indicator" *ngIf="isLoading">
        <p>Carregando credenciais...</p>
      </div>
      
      <div class="credentials-list" *ngIf="!isLoading && credentials.length > 0">
        <div class="credential-card" *ngFor="let credential of credentials">
          <div class="credential-info">
            <h3>{{ credential.credential_name }}</h3>
            <p class="credential-date">
              Última atualização: {{ credential.updated_at | date:'dd/MM/yyyy HH:mm' }}
            </p>
          </div>
          
          <div class="credential-actions">
            <button class="btn-edit" [routerLink]="['/cliente/credenciais/editar', credential.id]">
              Editar
            </button>
            <button class="btn-delete" (click)="confirmRevoke(credential)">
              Revogar
            </button>
          </div>
        </div>
      </div>
      
      <!-- Modal de confirmação de revogação -->
      <div class="modal-overlay" *ngIf="showRevokeModal">
        <div class="modal-content">
          <h3>Revogar Acesso</h3>
          <p>
            Tem certeza que deseja revogar a credencial <strong>{{ credentialToRevoke?.credential_name }}</strong>?
          </p>
          <p class="warning">
            Esta ação irá desativar o acesso do seu contador a esta credencial. Esta ação não pode ser desfeita.
          </p>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="cancelRevoke()">Cancelar</button>
            <button class="btn-confirm" (click)="revokeCredential()">Confirmar Revogação</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .credentials-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    
    h2 {
      color: #333;
      margin: 0;
    }
    
    .actions {
      display: flex;
      gap: 8px;
    }
    
    .btn-add {
      background-color: #2196f3;
      color: white;
      border: none;
      padding: 10px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      font-size: 14px;
      transition: background-color 0.3s;
    }
    
    .btn-add:hover {
      background-color: #1976d2;
    }
    
    .info-box {
      background-color: #e3f2fd;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      border-left: 4px solid #2196f3;
    }
    
    .credentials-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .credential-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .credential-info h3 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 18px;
    }
    
    .credential-date {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
    
    .credential-actions {
      display: flex;
      gap: 8px;
    }
    
    .btn-edit, .btn-delete {
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      font-size: 14px;
      transition: background-color 0.3s;
    }
    
    .btn-edit {
      background-color: #f5f5f5;
      color: #333;
    }
    
    .btn-delete {
      background-color: #ffebee;
      color: #d32f2f;
    }
    
    .btn-edit:hover {
      background-color: #e0e0e0;
    }
    
    .btn-delete:hover {
      background-color: #ffcdd2;
    }
    
    .loading-indicator {
      text-align: center;
      padding: 24px;
      color: #666;
    }
    
    /* Estilos para o modal de confirmação */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    
    .modal-content {
      background-color: white;
      padding: 24px;
      border-radius: 8px;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }
    
    .modal-content h3 {
      margin: 0 0 16px 0;
      color: #d32f2f;
    }
    
    .warning {
      background-color: #ffebee;
      padding: 12px;
      border-radius: 4px;
      color: #b71c1c;
      margin: 16px 0;
    }
    
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }
    
    .btn-cancel, .btn-confirm {
      padding: 10px 16px;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      border: none;
    }
    
    .btn-cancel {
      background-color: #f5f5f5;
      color: #333;
    }
    
    .btn-confirm {
      background-color: #d32f2f;
      color: white;
    }
    
    .btn-confirm:hover {
      background-color: #b71c1c;
    }
    
    @media (max-width: 600px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
      
      .credential-card {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .credential-actions {
        margin-top: 16px;
        width: 100%;
      }
      
      .btn-edit, .btn-delete {
        flex: 1;
        text-align: center;
      }
    }
  `]
})
export class GovCredentialsListComponent implements OnInit {
  private govCredentialsService = inject(GovCredentialsService);
  private authStore = inject(AuthStore);
  
  credentials: IGovCredentials[] = [];
  isLoading = true;
  showRevokeModal = false;
  credentialToRevoke: IGovCredentials | null = null;
  userId = ''; // Este ID virá da autenticação
  
  ngOnInit(): void {
    // Obter ID do usuário da sessão
    // Em uma aplicação real, isso seria obtido do serviço de autenticação
    this.userId = this.authStore.user()!.id;
    
    // Carregar credenciais do cliente
    this.loadCredentials();
  }
  
  /**
   * Carrega as credenciais do cliente
   */
  async loadCredentials(): Promise<void> {
    this.isLoading = true;
    try {
      this.credentials = await this.govCredentialsService.getClientCredentials(this.userId);
    } catch (error) {
      console.error('Erro ao carregar credenciais:', error);
    } finally {
      this.isLoading = false;
    }
  }
  
  /**
   * Abre o modal de confirmação para revogar uma credencial
   */
  confirmRevoke(credential: IGovCredentials): void {
    this.credentialToRevoke = credential;
    this.showRevokeModal = true;
  }
  
  /**
   * Cancela a revogação e fecha o modal
   */
  cancelRevoke(): void {
    this.credentialToRevoke = null;
    this.showRevokeModal = false;
  }
  
  /**
   * Revoga a credencial selecionada
   */
  async revokeCredential(): Promise<void> {
    if (!this.credentialToRevoke || !this.credentialToRevoke.id) {
      return;
    }
    
    try {
      await this.govCredentialsService.revokeCredential(
        this.credentialToRevoke.id,
        this.userId
      );
      
      // Atualizar lista de credenciais
      this.loadCredentials();
      
      // Fechar modal
      this.cancelRevoke();
    } catch (error) {
      console.error('Erro ao revogar credencial:', error);
      // Aqui você pode adicionar tratamento de erro mais específico
    }
  }
}