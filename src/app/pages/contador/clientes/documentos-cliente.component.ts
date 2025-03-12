import { Component, OnInit, inject, signal, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatabaseService } from '../../../core/services/database.service';
import { IUser } from '../../../core/auth/models/user.interface';
import { StorageService } from '../../../core/storage/services/storage.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';

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
  path?: string;
  mimetype?: string;
}

// Interface para os objetos de arquivo retornados pelo storage
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
    NzUploadModule,
    NzSkeletonModule,
    NzToolTipModule,
    NzModalModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <div class="bg-white rounded-lg shadow-md p-6">
        <div *ngIf="carregando()" class="flex justify-center my-8">
          <nz-spin nzTip="Carregando informações..."></nz-spin>
        </div>

        <div *ngIf="!carregando() && cliente()">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h2 class="text-2xl font-semibold text-gray-800">
                Documentos de {{ cliente()?.nome_completo }}
              </h2>
              <p class="text-gray-600">
                Email: {{ cliente()?.email }}
              </p>
            </div>
            <div class="mt-4 md:mt-0">
              <button 
                nz-button 
                nzType="default" 
                [routerLink]="['/contador/clientes']"
                class="flex items-center"
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
                  <div class="flex space-x-2">
                    <button 
                      nz-button 
                      nzType="primary" 
                      nzShape="circle"
                      nz-tooltip="Visualizar"
                      (click)="visualizarDocumento(documento)"
                    >
                      <span nz-icon nzType="eye"></span>
                    </button>              
                  </div>
                </td>
              </tr>
            </tbody>
          </nz-table>

          <!-- Mensagem quando não há documentos -->
          <div *ngIf="!carregandoDocumentos() && documentos().length === 0" class="my-8">
            <nz-empty 
              nzDescription="Nenhum documento encontrado para este cliente"
            ></nz-empty>
          </div>
        </div>

        <!-- Mensagem quando cliente não encontrado -->
        <div *ngIf="!carregando() && !cliente()" class="my-8">
          <nz-empty 
            nzDescription="Cliente não encontrado"
          ></nz-empty>
          <div class="flex justify-center mt-4">
            <button 
              nz-button 
              nzType="primary" 
              [routerLink]="['/contador/clientes']"
            >
              Voltar para lista de clientes
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Template para o modal de visualização de PDF -->
    <ng-template #pdfViewerModal>
      <div *ngIf="carregandoVisualizacao" class="flex justify-center my-4">
        <nz-spin nzTip="Carregando documento..."></nz-spin>
      </div>
      
      <div *ngIf="!carregandoVisualizacao && urlSegura" class="pdf-container">
        <iframe 
          [src]="urlSegura" 
          width="100%" 
          height="600px" 
          frameborder="0"
          class="rounded-lg"
        ></iframe>
      </div>
      
      <div *ngIf="!carregandoVisualizacao && !urlSegura" class="my-4 text-center">
        <p class="text-red-500">Não foi possível carregar o documento.</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .pdf-container {
      width: 100%;
      height: 600px;
      overflow: hidden;
    }
  `]
})
export class DocumentosClienteComponent implements OnInit {
  // Injeção de dependências
  private route = inject(ActivatedRoute);
  private databaseService = inject(DatabaseService);
  private messageService = inject(NzMessageService);
  private storageService = inject(StorageService);
  private modal = inject(NzModalService);
  private sanitizer = inject(DomSanitizer);

  // Signals
  cliente = signal<IUser | null>(null);
  documentos = signal<IDocumento[]>([]);
  carregando = signal<boolean>(false);
  carregandoDocumentos = signal<boolean>(false);

  // Propriedades
  clienteId = '';
  documentoAtual: IDocumento | null = null;
  urlSegura: SafeResourceUrl | null = null;
  carregandoVisualizacao = false;
  
  // Template para o modal de visualização de documentos
  @ViewChild('pdfViewerModal') pdfViewerModal!: TemplateRef<any>;

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
   * Carrega os documentos do cliente usando o StorageService
   */
  async carregarDocumentos(): Promise<void> {
    try {
      if (!this.clienteId) {
        this.messageService.error('ID do cliente não encontrado');
        return;
      }

      this.carregandoDocumentos.set(true);
      
      // Caminho para os documentos do cliente
      const clientePath = `documentos_${this.clienteId}`;
      
      // Busca os arquivos no storage
      const files = await this.storageService.listFiles(clientePath);
      
      // Transforma os objetos FileObject em objetos IDocumento para a UI
      const docs = files.map((file: FileObject) => {
        // Gera a URL pública para o arquivo
        const url = this.storageService.getPublicUrl(`${clientePath}/${file.name}`);
        
        // Determina o tipo de documento baseado no mimetype ou extensão
        let tipo = 'Documento';
        if (file.metadata?.mimetype) {
          if (file.metadata.mimetype.includes('pdf')) {
            tipo = 'PDF';
          } else if (file.metadata.mimetype.includes('image')) {
            tipo = 'Imagem';
          } else if (file.metadata.mimetype.includes('excel') || file.metadata.mimetype.includes('spreadsheet')) {
            tipo = 'Planilha';
          } else if (file.metadata.mimetype.includes('word') || file.metadata.mimetype.includes('document')) {
            tipo = 'Texto';
          }
        }
        
        // Formata o tamanho do arquivo
        const tamanho = this.formatarTamanho(file.metadata?.size || 0);
        
        return {
          id: file.id,
          nome: file.name,
          tipo: tipo,
          data: file.created_at,
          status: 'disponível', // Status padrão para documentos carregados
          tamanho: tamanho,
          url: url,
          path: `${clientePath}/${file.name}`,
          mimetype: file.metadata?.mimetype
        } as IDocumento;
      });

      this.documentos.set(docs);
      
      if (docs.length === 0) {
        this.messageService.info('Nenhum documento encontrado para este cliente');
      }
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      this.messageService.error('Erro ao carregar documentos. Tente novamente.');
    } finally {
      this.carregandoDocumentos.set(false);
    }
  }

  /**
   * Formata o tamanho do arquivo para exibição
   * @param bytes Tamanho em bytes
   * @returns Tamanho formatado (ex: 1.2 MB)
   */
  formatarTamanho(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Visualiza um documento usando URL assinada
   * @param documento - Documento a ser visualizado
   */
  async visualizarDocumento(documento: IDocumento): Promise<void> {
    if (!documento.path) {
      this.messageService.error('Caminho do documento não disponível');
      return;
    }
    
    try {
      this.carregandoVisualizacao = true;
      this.documentoAtual = documento;
      
      // Gera URL assinada com validade de 5 minutos (300 segundos)
      const urlAssinada = await this.storageService.createSignedUrl(documento.path, 300);
      
      if (!urlAssinada) {
        this.messageService.error('Não foi possível gerar URL para visualização');
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
      this.messageService.error('Erro ao visualizar documento');
      this.carregandoVisualizacao = false;
    }
  }

  /**
   * Baixa um documento usando URL assinada
   * @param documento - Documento a ser baixado
   */
  async baixarDocumento(documento: IDocumento): Promise<void> {
    if (!documento.path) {
      this.messageService.error('Caminho do documento não disponível');
      return;
    }
    
    try {
      // Gera URL assinada com validade de 60 segundos
      const urlAssinada = await this.storageService.createSignedUrl(documento.path, 60);
      
      if (!urlAssinada) {
        this.messageService.error('Não foi possível gerar URL para download');
        return;
      }
      
      // Abre a URL em uma nova aba para download
      window.open(urlAssinada, '_blank');
      this.messageService.success(`Documento baixado: ${documento.nome}`);
    } catch (error) {
      console.error('Erro ao baixar documento:', error);
      this.messageService.error('Erro ao baixar documento');
    }
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