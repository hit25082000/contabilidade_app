import { Component, inject, signal, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../../core/storage/services/storage.service';
import { environment } from '../../../../environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NzModalService } from 'ng-zorro-antd/modal';

// Importações do NG-ZORRO
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { url } from 'inspector';
import { AuthStore } from '../../../core/auth/service/auth.store';

/**
 * Interface que representa um arquivo no Supabase Storage
 * Baseada no retorno real da API do Supabase
 */
interface FileObject {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    eTag: string;
    size: number;
    mimetype: string;
    cacheControl: string;
    lastModified: string;
    contentLength: number;
    httpStatusCode: number;
  };
}

/**
 * Interface para o modelo de documento usado na UI
 */
interface Documento {
  nome: string;
  url: string;
  dataUpload: Date;
  tamanho?: number;
  id?: string;
  mimetype?: string;
  path?: string;
}

/**
 * Componente para listar e gerenciar documentos do usuário
 * Permite visualizar, baixar e excluir documentos
 */
@Component({
  selector: 'app-listar-documentos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzPopconfirmModule,
    NzEmptyModule,
    NzInputModule,
    NzToolTipModule,
    NzAlertModule,
    NzModalModule,
    NzSpinModule
  ],
  template: `
    <nz-card>
      <h3 class="section-title">Meus Documentos</h3>
      <p class="section-description">Gerencie seus documentos enviados</p>

      <!-- Mensagem de erro -->
      <nz-alert
        *ngIf="erro()"
        nzType="error"
        [nzMessage]="erro()"
        nzShowIcon
        class="error-alert"
      ></nz-alert>

      <!-- Barra de pesquisa -->
      <div class="search-bar">
        <nz-input-group [nzSuffix]="suffixIconSearch">
          <input
            type="text"
            nz-input
            placeholder="Buscar documentos..."
            [(ngModel)]="termoBusca"
            (ngModelChange)="filtrarDocumentos()"
          />
        </nz-input-group>
        <ng-template #suffixIconSearch>
          <span nz-icon nzType="search"></span>
        </ng-template>
      </div>

      <!-- Tabela de documentos -->
      <nz-table
        #basicTable
        [nzData]="documentosFiltrados()"
        [nzLoading]="isLoading()"
        [nzShowPagination]="true"
        [nzPageSize]="5">
        <thead>
          <tr>
            <th nzWidth="40%">Nome do Documento</th>
            <th nzWidth="20%">Data de Upload</th>
            <th nzWidth="15%">Tamanho</th>
            <th nzWidth="25%">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let documento of basicTable.data">
            <td>
              <span nz-tooltip [nzTooltipTitle]="documento.nome">
                {{ documento.nome | slice:0:30 }}{{ documento.nome.length > 30 ? '...' : '' }}
              </span>
            </td>
            <td>{{ documento.dataUpload | date:'dd/MM/yyyy HH:mm' }}</td>
            <td>{{ formatarTamanho(documento.tamanho) }}</td>
            <td>
              <button 
                (click)="visualizarDocumento(documento)" 
                nz-button 
                nzType="link"
                nz-tooltip="Visualizar PDF">
                <span nz-icon nzType="eye"></span>
              </button>
              <button 
                (click)="baixarDocumento(documento)" 
                nz-button 
                nzType="link"
                nz-tooltip="Baixar PDF">
                <span nz-icon nzType="download"></span>
              </button>
              <button 
                nz-button 
                nzType="link" 
                nzDanger
                nz-popconfirm
                nzPopconfirmTitle="Tem certeza que deseja excluir este documento?"
                (nzOnConfirm)="excluirDocumento(documento)"
                nz-tooltip="Excluir PDF">
                <span nz-icon nzType="delete"></span>
              </button>
            </td>
          </tr>
        </tbody>
      </nz-table>

      <nz-empty 
        *ngIf="documentosFiltrados().length === 0 && !isLoading()"
        [nzNotFoundContent]="mensagemVazia">
      </nz-empty>

      <ng-template #mensagemVazia>
        {{ termoBusca ? 'Nenhum documento encontrado para a busca' : 'Nenhum documento encontrado' }}
      </ng-template>
    </nz-card>

    <!-- Template do modal para visualização de PDF -->
    <ng-template #pdfViewerModal>
      <div class="pdf-container">
        <div *ngIf="carregandoVisualizacao" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Carregando documento...</p>
        </div>
        <iframe 
          *ngIf="!carregandoVisualizacao && urlSegura" 
          [src]="urlSegura" 
          width="100%" 
          height="500px" 
          frameborder="0">
        </iframe>
      </div>
    </ng-template>
  `,
  styles: [`
    .section-title {
      font-size: 20px;
      margin-bottom: 8px;
      color: #262626;
    }

    .section-description {
      color: #595959;
      margin-bottom: 16px;
    }

    .search-bar {
      margin-bottom: 16px;
    }

    .error-alert {
      margin-bottom: 16px;
    }

    :host ::ng-deep .ant-table-tbody > tr > td {
      vertical-align: middle;
    }

    @media (max-width: 400px) {
      .section-title {
        font-size: 18px;
      }

      .section-description {
        font-size: 14px;
      }

      :host ::ng-deep .ant-table-tbody > tr > td {
        padding: 8px;
      }

      button {
        padding: 4px 8px;
      }
    }

    .pdf-container {
      width: 100%;
      min-height: 500px;
      position: relative;
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 500px;
    }
    
    .loading-spinner {
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top: 4px solid #1890ff;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class ListarDocumentosComponent {
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);
  private sanitizer = inject(DomSanitizer);
  private storageService = inject(StorageService);
  private authStore = inject(AuthStore)

  // Signals
  documentos = signal<Documento[]>([]);
  documentosFiltrados = signal<Documento[]>([]);
  isLoading = signal(false);
  erro = signal<string | null>(null);

  // Estado local
  termoBusca = '';
  pdfUrlSafe: SafeResourceUrl | null = null;
  @ViewChild('pdfViewerModal') pdfViewerModal!: TemplateRef<any>;
  documentoAtual: Documento | null = null;
  urlSegura: SafeResourceUrl | null = null;
  carregandoVisualizacao = false;

  constructor() {
    this.carregarDocumentos();
    console.log(this.documentos())
  }

  async carregarDocumentos(): Promise<void> {
    try {
      const userPath = `documentos_${this.authStore.user()?.id}`
      
      this.isLoading.set(true);
      this.erro.set(null);
      
      const files = await this.storageService.listFiles(userPath);
      
      // Transforma os objetos FileObject em objetos Documento para a UI
      const docs = files.map((file: FileObject) => {
        // Gera a URL pública para o arquivo
        const url = this.storageService.getPublicUrl(`${userPath}/${file.name}`);
        
        return {
          nome: file.name,
          url: url,
          dataUpload: new Date(file.created_at),
          tamanho: file.metadata?.size,
          id: file.id,
          mimetype: file.metadata?.mimetype,
          path: `${userPath}/${file.name}`
        } as Documento;
      });

      this.documentos.set(docs);
      this.documentosFiltrados.set(docs);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      this.erro.set('Não foi possível carregar os documentos. Tente novamente mais tarde.');
      this.message.error('Erro ao carregar documentos. Tente novamente.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async excluirDocumento(documento: Documento): Promise<void> {
    try {
      this.isLoading.set(true);
      this.erro.set(null);
      
      await this.storageService.deleteFile(`documentos/${documento.nome}`);
      
      // Atualiza as listas após excluir
      const docs = this.documentos().filter(doc => doc.url !== documento.url);
      this.documentos.set(docs);
      this.filtrarDocumentos(); // Atualiza a lista filtrada

      this.message.success('Documento excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      this.erro.set('Não foi possível excluir o documento. Tente novamente mais tarde.');
      this.message.error('Erro ao excluir documento. Tente novamente.');
    } finally {
      this.isLoading.set(false);
    }
  }

  filtrarDocumentos(): void {
    if (!this.termoBusca) {
      this.documentosFiltrados.set(this.documentos());
      return;
    }

    const termo = this.termoBusca.toLowerCase();
    const filtrados = this.documentos().filter(doc => 
      doc.nome.toLowerCase().includes(termo)
    );
    
    this.documentosFiltrados.set(filtrados);
  }

  private extrairNomeDoArquivo(url: string): string {
    const partes = url.split('/');
    return partes[partes.length - 1];
  }

  formatarTamanho(tamanho?: number): string {
    if (!tamanho) return 'Não disponível';

    if (tamanho < 1024) {
      return `${tamanho} bytes`;
    } else if (tamanho < 1024 * 1024) {
      return `${(tamanho / 1024).toFixed(2)} KB`;
    } else {
      return `${(tamanho / (1024 * 1024)).toFixed(2)} MB`;
    }
  }

  /**
   * Visualiza um documento usando URL assinada para acesso temporário
   * @param documento Documento a ser visualizado
   */
  async visualizarDocumento(documento: Documento): Promise<void> {
    if (!documento.path) {
      console.error('Caminho do documento não disponível');
      return;
    }
    
    try {
      this.carregandoVisualizacao = true;
      this.documentoAtual = documento;
      
      // Gera URL assinada com validade de 5 minutos (300 segundos)
      const urlAssinada = await this.storageService.createSignedUrl(documento.path, 300);
      console.log(documento.path)
      if (!urlAssinada) {
        console.error('Não foi possível gerar URL assinada para o documento');
        this.carregandoVisualizacao = false;
        return;
      }
      
      // Sanitiza a URL para uso seguro no iframe
      this.urlSegura = this.sanitizer.bypassSecurityTrustResourceUrl(urlAssinada);
      this.carregandoVisualizacao = false;
      
      // Abre o modal com o visualizador de PDF
      this.modal.create({
        nzTitle: documento.nome,
        nzContent: this.pdfViewerModal,
        nzWidth: '80%',
        nzFooter: null,
        nzCentered: true
      });
    } catch (error) {
      console.error('Erro ao visualizar documento:', error);
      this.carregandoVisualizacao = false;
    }
  }

  /**
   * Baixa um documento usando URL assinada
   * @param documento Documento a ser baixado
   */
  async baixarDocumento(documento: Documento): Promise<void> {
    if (!documento.path) {
      console.error('Caminho do documento não disponível');
      return;
    }
    
    try {
      // Gera URL assinada com validade de 60 segundos
      const urlAssinada = await this.storageService.createSignedUrl(documento.path, 60);
      
      if (!urlAssinada) {
        console.error('Não foi possível gerar URL assinada para download');
        return;
      }
      
      window.open(urlAssinada, '_blank');
    } catch (error) {
      console.error('Erro ao baixar documento:', error);
    }
  }
} 