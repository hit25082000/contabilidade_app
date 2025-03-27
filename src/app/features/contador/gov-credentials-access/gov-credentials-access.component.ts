import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GovCredentialsService } from '../../../core/services/gov-credentials.service';
import { IDecryptedCredential } from '../../../core/models/gov-credentials.model';
import { AuthStore } from '../../../core/auth/service/auth.store';

/**
 * Componente para o contador acessar as credenciais governamentais dos clientes
 * Mostra lista de credenciais disponíveis e permite visualizar os dados de acesso
 */
@Component({
  selector: 'app-gov-credentials-access',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="access-container">
      <div class="access-header">
        <h2>Credenciais Governamentais dos Clientes</h2>
      </div>
      
      <div class="info-box" *ngIf="!isLoading && clientCredentials.length === 0">
        <p>
          <strong>Nenhuma credencial disponível.</strong>
        </p>
        <p>
          Nenhum de seus clientes compartilhou credenciais de acesso aos portais governamentais.
          Os clientes precisam cadastrar essas informações em suas contas para que você possa acessá-las.
        </p>
      </div>
      
      <div class="loading-indicator" *ngIf="isLoading">
        <p>Carregando credenciais...</p>
      </div>
      
      <div class="credentials-list" *ngIf="!isLoading && clientCredentials.length > 0">
        <div class="credential-card" *ngFor="let credential of clientCredentials">
          <div class="credential-info">
            <h3>{{ credential.credential_name }}</h3>
            <p class="cliente-info">
              Cliente: <strong>{{ credential.cliente_nome }}</strong> ({{ credential.cliente_documento }})
            </p>
            <p class="credential-date">
              Última atualização: {{ credential.updated_at | date:'dd/MM/yyyy HH:mm' }}
            </p>
          </div>
          
          <div class="credential-actions">
            <button class="btn-view" (click)="viewCredential(credential)">
              Visualizar Acesso
            </button>
          </div>
        </div>
      </div>
      
      <!-- Modal para visualização das credenciais -->
      <div class="modal-overlay" *ngIf="showCredentialModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Dados de Acesso</h3>
            <button class="btn-close" (click)="closeModal()">×</button>
          </div>
          
          <div class="loading-indicator" *ngIf="isDecrypting">
            <p>Descriptografando dados...</p>
          </div>
          
          <div class="credential-details" *ngIf="!isDecrypting && decryptedCredential">
            <div class="credential-detail-item">
              <span class="label">Cliente:</span>
              <span class="value">{{ selectedCredential?.cliente_nome }}</span>
            </div>
            
            <div class="credential-detail-item">
              <span class="label">Documento:</span>
              <span class="value">{{ selectedCredential?.cliente_documento }}</span>
            </div>
            
            <div class="credential-detail-item">
              <span class="label">Portal:</span>
              <span class="value">{{ decryptedCredential.portal }}</span>
            </div>
            
            <div class="credential-detail-item">
              <span class="label">Email/Login:</span>
              <span class="value">{{ decryptedCredential.email }}</span>
              <button class="btn-copy" (click)="copyToClipboard(decryptedCredential.email)">Copiar</button>
            </div>
            
            <div class="credential-detail-item">
              <span class="label">Senha:</span>
              <div class="password-container">
                <span class="value password">{{ hidePassword ? '••••••••••' : decryptedCredential.password }}</span>
                <button class="btn-toggle" (click)="togglePasswordVisibility()">
                  {{ hidePassword ? 'Mostrar' : 'Ocultar' }}
                </button>
                <button class="btn-copy" (click)="copyToClipboard(decryptedCredential.password)">Copiar</button>
              </div>
            </div>
            
            <div class="credential-detail-item" *ngIf="decryptedCredential.expiration_date">
              <span class="label">Validade:</span>
              <span class="value">{{ decryptedCredential.expiration_date | date:'dd/MM/yyyy' }}</span>
            </div>
            
            <div class="credential-detail-item notes" *ngIf="decryptedCredential.notes">
              <span class="label">Observações:</span>
              <div class="notes-container">
                <p class="value">{{ decryptedCredential.notes }}</p>
              </div>
            </div>
            
            <div class="credential-access-warning">
              <p>
                <strong>Importante:</strong> Este acesso está sendo registrado para fins de segurança.
                Você é responsável por manter estas informações em sigilo e utilizá-las apenas para
                fins profissionais relacionados à prestação de serviços contábeis.
              </p>
            </div>
          </div>
          
          <div class="modal-footer" *ngIf="!isDecrypting">
            <button class="btn-open-portal" *ngIf="decryptedCredential" (click)="openPortal()">
              Acessar Portal
            </button>
            <button class="btn-close-modal" (click)="closeModal()">Fechar</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .access-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .access-header {
      margin-bottom: 24px;
    }
    
    h2 {
      color: #333;
      margin: 0;
    }
    
    .info-box {
      background-color: #e3f2fd;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      border-left: 4px solid #2196f3;
    }
    
    .loading-indicator {
      text-align: center;
      padding: 24px;
      color: #666;
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
    
    .cliente-info {
      margin: 0 0 4px 0;
      color: #333;
    }
    
    .credential-date {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
    
    .credential-actions {
      display: flex;
    }
    
    .btn-view {
      background-color: #2196f3;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.3s;
    }
    
    .btn-view:hover {
      background-color: #1976d2;
    }
    
    /* Estilos para o modal */
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
      border-radius: 8px;
      width: 90%;
      max-width: 600px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      max-height: 90vh;
    }
    
    .modal-header {
      padding: 16px 24px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .modal-header h3 {
      margin: 0;
      color: #333;
    }
    
    .btn-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
    }
    
    .credential-details {
      padding: 24px;
      overflow-y: auto;
    }
    
    .credential-detail-item {
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
    }
    
    .label {
      font-weight: 500;
      color: #555;
      width: 100px;
      margin-right: 8px;
    }
    
    .value {
      color: #333;
      flex: 1;
      word-break: break-word;
    }
    
    .password-container {
      display: flex;
      align-items: center;
      flex: 1;
    }
    
    .btn-toggle, .btn-copy {
      background-color: #f5f5f5;
      border: 1px solid #ddd;
      padding: 4px 8px;
      margin-left: 8px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
    }
    
    .btn-toggle:hover, .btn-copy:hover {
      background-color: #e0e0e0;
    }
    
    .notes-container {
      background-color: #f9f9f9;
      padding: 12px;
      border-radius: 4px;
      margin-top: 8px;
      width: 100%;
    }
    
    .notes-container p {
      margin: 0;
      white-space: pre-line;
    }
    
    .credential-access-warning {
      background-color: #fff8e1;
      padding: 12px;
      border-radius: 4px;
      margin-top: 24px;
      border-left: 4px solid #ffc107;
    }
    
    .credential-access-warning p {
      margin: 0;
      font-size: 14px;
      color: #5d4037;
    }
    
    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    
    .btn-open-portal {
      background-color: #4caf50;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }
    
    .btn-open-portal:hover {
      background-color: #43a047;
    }
    
    .btn-close-modal {
      background-color: #f5f5f5;
      color: #333;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }
    
    .notes.credential-detail-item {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .notes .label {
      margin-bottom: 8px;
    }
    
    @media (max-width: 600px) {
      .credential-card {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .credential-actions {
        margin-top: 16px;
        width: 100%;
      }
      
      .btn-view {
        width: 100%;
        text-align: center;
      }
      
      .credential-detail-item {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .label {
        width: 100%;
        margin-bottom: 4px;
      }
      
      .password-container {
        flex-wrap: wrap;
      }
      
      .btn-toggle, .btn-copy {
        margin-top: 8px;
      }
    }
  `]
})
export class GovCredentialsAccessComponent implements OnInit {
  private govCredentialsService = inject(GovCredentialsService);
  private authStore  = inject(AuthStore);
  
  clientCredentials: any[] = [];
  isLoading = true;
  showCredentialModal = false;
  isDecrypting = false;
  selectedCredential: any = null;
  decryptedCredential: IDecryptedCredential | null = null;
  hidePassword = true;
  contadorId = ''; // Este ID virá da autenticação
  
  ngOnInit(): void {
    // Obter ID do contador da sessão
    // Em uma aplicação real, isso seria obtido do serviço de autenticação
    this.contadorId = this.authStore.user()!.id;   
    // Carregar credenciais dos clientes

    if(this.contadorId){
      console.log(this.contadorId)
      this.loadCredentials();
    }
  }
  
  /**
   * Carrega as credenciais dos clientes vinculados ao contador
   */
  async loadCredentials(): Promise<void> {
    this.isLoading = true;
    try {
      this.clientCredentials = await this.govCredentialsService.getCredentialsForContador(this.contadorId);
    } catch (error) {
      console.error('Erro ao carregar credenciais dos clientes:', error);
    } finally {
      this.isLoading = false;
    }
  }
  
  /**
   * Abre o modal e carrega os dados da credencial
   */
  async viewCredential(credential: any): Promise<void> {
    this.selectedCredential = credential;
    this.showCredentialModal = true;
    this.hidePassword = true;
    this.decryptedCredential = null;
    
    await this.loadDecryptedCredential();
  }
  
  /**
   * Carrega os dados descriptografados da credencial
   */
  async loadDecryptedCredential(): Promise<void> {
    if (!this.selectedCredential) return;
    
    this.isDecrypting = true;
    try {
      this.decryptedCredential = await this.govCredentialsService.decryptCredential(
        this.selectedCredential.credential_id,
        this.contadorId
      );
    } catch (error) {
      console.error('Erro ao descriptografar credencial:', error);
      // Aqui você pode adicionar tratamento de erro mais específico
    } finally {
      this.isDecrypting = false;
    }
  }
  
  /**
   * Fecha o modal e limpa os dados
   */
  closeModal(): void {
    this.showCredentialModal = false;
    this.selectedCredential = null;
    this.decryptedCredential = null;
  }
  
  /**
   * Alterna a visibilidade da senha
   */
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
  
  /**
   * Copia um texto para a área de transferência
   */
  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(
      () => {
        // Sucesso
        console.log('Texto copiado para a área de transferência');
      },
      (err) => {
        // Erro
        console.error('Não foi possível copiar o texto: ', err);
      }
    );
  }
  
  /**
   * Abre o portal governamental em uma nova aba
   */
  openPortal(): void {
    if (!this.decryptedCredential) return;
    
    let url = '';
    
    // Determinar URL com base no tipo de portal
    switch (this.decryptedCredential.portal) {
      case 'Portal e-CAC':
        url = 'https://cav.receita.fazenda.gov.br/';
        break;
      case 'eSocial':
        url = 'https://login.esocial.gov.br/';
        break;
      case 'Gov.BR':
        url = 'https://sso.acesso.gov.br/';
        break;
      case 'Portal INSS':
        url = 'https://meu.inss.gov.br/';
        break;
      case 'PGDAS-D':
        url = 'https://www8.receita.fazenda.gov.br/SimplesNacional/';
        break;
      default:
        // Tentar encontrar URL básica no nome do portal
        const portalLower = this.decryptedCredential.portal.toLowerCase();
        if (portalLower.includes('gov.br')) {
          url = 'https://sso.acesso.gov.br/';
        } else if (portalLower.includes('receita')) {
          url = 'https://www.gov.br/receitafederal/';
        } else {
          url = `https://www.google.com/search?q=${encodeURIComponent(this.decryptedCredential.portal)}`;
        }
    }
    
    // Abrir URL em uma nova aba
    window.open(url, '_blank');
  }
} 