import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../../core/storage/services/storage.service';
import { environment } from '../../../../environments/environment';

// Importações do NG-ZORRO
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { url } from 'inspector';

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
    NzAlertModule
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
              <a 
                [href]="documento.url" 
                target="_blank" 
                nz-button 
                nzType="link"
                nz-tooltip="Visualizar PDF">
                <span nz-icon nzType="eye"></span>
              </a>
              <a 
                [href]="documento.url" 
                download 
                nz-button 
                nzType="link"
                nz-tooltip="Baixar PDF">
                <span nz-icon nzType="download"></span>
              </a>
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
  `]
})
export class ListarDocumentosComponent {
  private storageService = inject(StorageService);
  private message = inject(NzMessageService);

  // Signals
  documentos = signal<Documento[]>([]);
  documentosFiltrados = signal<Documento[]>([]);
  isLoading = signal(false);
  erro = signal<string | null>(null);

  // Estado local
  termoBusca = '';

  constructor() {
    this.carregarDocumentos();
    console.log(this.documentos())
  }

  async carregarDocumentos(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.erro.set(null);
      
      const files = await this.storageService.listFiles('documentos');
      console.log('Documentos retornados:', files);
      
      // Transforma os objetos FileObject em objetos Documento para a UI
      const docs = files.map((file: FileObject) => {
        // Gera a URL pública para o arquivo
        const url = `${environment.SUPABASE_URL}/storage/v1/object/public/documentos/${file.name}`;
        
        return {
          nome: file.name,
          url: url,
          dataUpload: new Date(file.created_at),
          tamanho: file.metadata?.size,
          id: file.id,
          mimetype: file.metadata?.mimetype
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
} 