import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalService, NzModalRef } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';

@Component({
  selector: 'app-gov-credentials-help',
  standalone: true,
  imports: [
    CommonModule,
    NzIconModule,
    NzModalModule,
    NzButtonModule,
    NzCardModule,
    NzCollapseModule
  ],
  template: `
    <div class="help-container">
      <button 
        nz-button 
        nzType="text" 
        class="help-button" 
        (click)="openHelpModal()">
        <span nz-icon nzType="question-circle" nzTheme="outline"></span>
        <span class="help-text">Ajuda</span>
      </button>
    </div>

    <!-- Modal será aberto pelo serviço NzModalService -->
  `,
  styles: [`
    .help-container {
      margin: 10px 0;
      text-align: right;
    }
    
    .help-button {
      color: #1890ff;
    }
    
    .help-text {
      margin-left: 5px;
    }
    
    :host ::ng-deep .ant-modal-body {
      max-height: 70vh;
      overflow-y: auto;
    }
    
    .help-section {
      margin-bottom: 20px;
    }
    
    .help-title {
      font-weight: bold;
      margin-bottom: 8px;
    }

    .help-content {
      margin-left: 10px;
    }

    .error-example {
      background-color: #fff2f0;
      border-left: 4px solid #ff4d4f;
      padding: 8px 12px;
      margin: 8px 0;
      border-radius: 2px;
    }
  `]
})
export class GovCredentialsHelpComponent {
  @Input() contextType: 'list' | 'form' | 'contador' = 'list';

  constructor(private modalService: NzModalService) {}

  openHelpModal(): void {
    this.modalService.create({
      nzTitle: 'Ajuda - Credenciais Governamentais',
      nzContent: this.getHelpContent(),
      nzWidth: '600px',
      nzFooter: [
        {
          label: 'Fechar',
          onClick: (instance: NzModalRef) => instance.destroy()
        }
      ]
    });
  }

  private getHelpContent(): string {
    let content = '';

    // Conteúdo compartilhado para todos os contextos
    const sharedContent = `
      <div class="help-section">
        <div class="help-title">O que são credenciais governamentais?</div>
        <div class="help-content">
          Credenciais governamentais são informações de acesso a sistemas do governo (como e-CAC, 
          Conectividade Social, etc.) que você pode compartilhar com seu contador de forma segura.
        </div>
      </div>
      
      <div class="help-section">
        <div class="help-title">Segurança</div>
        <div class="help-content">
          <ul>
            <li>Suas credenciais são criptografadas antes de serem armazenadas</li>
            <li>Apenas você e seu contador têm acesso a essas informações</li>
            <li>Todas as operações são registradas em um log de acesso</li>
          </ul>
        </div>
      </div>
    `;

    // Conteúdo específico para cada contexto
    switch (this.contextType) {
      case 'list':
        content = `
          ${sharedContent}
          
          <div class="help-section">
            <div class="help-title">Gerenciando suas credenciais</div>
            <div class="help-content">
              <ul>
                <li><strong>Adicionar</strong>: Clique no botão "Nova Credencial" para adicionar uma nova credencial</li>
                <li><strong>Editar</strong>: Clique no ícone de edição para modificar uma credencial existente</li>
                <li><strong>Excluir</strong>: Clique no ícone de lixeira para revogar o acesso a uma credencial</li>
                <li><strong>Visualizar detalhes</strong>: Clique no nome da credencial para visualizar seus detalhes</li>
              </ul>
            </div>
          </div>
          
          <div class="help-section">
            <div class="help-title">Problemas comuns</div>
            <div class="help-content">
              <p><strong>Nenhuma credencial aparece na lista:</strong> Verifique se você está conectado à internet e autenticado no sistema.</p>
              <p><strong>Erro ao excluir credencial:</strong> Tente recarregar a página e tentar novamente.</p>
            </div>
          </div>
        `;
        break;
        
      case 'form':
        content = `
          ${sharedContent}
          
          <div class="help-section">
            <div class="help-title">Preenchendo o formulário</div>
            <div class="help-content">
              <ul>
                <li><strong>Nome da Credencial</strong>: Escolha um nome descritivo (ex: "e-CAC Empresa X")</li>
                <li><strong>Tipo de Sistema</strong>: Selecione o sistema governamental relacionado</li>
                <li><strong>Usuário/Login</strong>: Informe seu nome de usuário para o sistema</li>
                <li><strong>Senha</strong>: Digite sua senha para o sistema (será criptografada)</li>
                <li><strong>Certificado Digital</strong>: Se aplicável, faça upload do arquivo do certificado</li>
                <li><strong>Observações</strong>: Adicione qualquer informação adicional importante</li>
              </ul>
            </div>
          </div>
          
          <div class="help-section">
            <div class="help-title">Problemas comuns</div>
            <div class="help-content">
              <p><strong>Erro ao salvar credencial:</strong></p>
              <div class="error-example">
                "invalid input syntax for type uuid"
              </div>
              <p>Este erro pode ocorrer se você não estiver autenticado corretamente. Tente sair e entrar novamente no sistema.</p>
              
              <p><strong>Erro de criptografia:</strong> Verifique se está usando um navegador moderno e atualizado.</p>
            </div>
          </div>
        `;
        break;
        
      case 'contador':
        content = `
          ${sharedContent}
          
          <div class="help-section">
            <div class="help-title">Acessando credenciais dos clientes</div>
            <div class="help-content">
              <ul>
                <li>As credenciais são agrupadas por cliente</li>
                <li>Clique no nome da credencial para visualizar os detalhes</li>
                <li>Todas as visualizações são registradas e o cliente tem acesso ao histórico</li>
                <li>Não é possível alterar as credenciais dos clientes</li>
              </ul>
            </div>
          </div>
          
          <div class="help-section">
            <div class="help-title">Problemas comuns</div>
            <div class="help-content">
              <p><strong>Não consegue ver as credenciais de um cliente:</strong> Verifique se o cliente concedeu acesso às credenciais.</p>
              <p><strong>Erro ao descriptografar credencial:</strong> Entre em contato com o suporte técnico.</p>
            </div>
          </div>
        `;
        break;
    }

    return content;
  }
} 