import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../../core/storage/services/storage.service';
import { FormsModule } from '@angular/forms';

// Importações do NG-ZORRO
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';

/**
 * Componente para upload de documentos PDF
 * Permite selecionar e enviar arquivos PDF para o storage
 */
@Component({
  selector: 'app-document-upload',
  imports: [
    CommonModule,
    FormsModule,
    NzUploadModule,
    NzButtonModule,
    NzIconModule,
    NzSpinModule
  ],
  template: `
    <div class="upload-container">
      <nz-spin [nzSpinning]="isLoading()">
        <input
          #fileInput
          type="file"
          accept=".pdf"
          style="display: none"
          (change)="onFileSelected($event)"
        />
        
        <div class="upload-area" (click)="fileInput.click()" (dragover)="onDragOver($event)" (drop)="onDrop($event)">
          <ng-container *ngIf="!selectedFile(); else fileSelected">
            <span nz-icon nzType="upload" nzTheme="outline" style="font-size: 48px"></span>
            <p>Clique ou arraste um arquivo PDF aqui</p>
          </ng-container>
          
          <ng-template #fileSelected>
            <span nz-icon nzType="file-pdf" nzTheme="outline" style="font-size: 48px; color: #ff4d4f"></span>
            <p>{{ selectedFile()?.name }}</p>
          </ng-template>
        </div>

        <div class="actions" *ngIf="selectedFile()">
          <button nz-button nzType="primary" (click)="uploadFile()" [disabled]="isLoading()">
            <span nz-icon nzType="upload"></span>
            Enviar Documento
          </button>
          <button nz-button nzType="default" (click)="clearSelection()" [disabled]="isLoading()">
            <span nz-icon nzType="close"></span>
            Cancelar
          </button>
        </div>
      </nz-spin>
    </div>
  `,
  styles: [`
    .upload-container {
      padding: 20px;
    }

    .upload-area {
      border: 2px dashed #d9d9d9;
      border-radius: 8px;
      padding: 40px;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.3s;
      background: #fafafa;
    }

    .upload-area:hover {
      border-color: #1890ff;
    }

    .upload-area p {
      margin-top: 16px;
      color: #666;
    }

    .actions {
      margin-top: 16px;
      display: flex;
      gap: 8px;
      justify-content: center;
    }

    @media (max-width: 400px) {
      .upload-container {
        padding: 10px;
      }

      .upload-area {
        padding: 20px;
      }

      .actions {
        flex-direction: column;
      }

      button {
        width: 100%;
      }
    }
  `]
})
export class DocumentUploadComponent {
  private storageService = inject(StorageService);
  private message = inject(NzMessageService);

  // Signals
  selectedFile = signal<File | null>(null);
  isLoading = signal(false);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      if (file.type === 'application/pdf') {
        this.selectedFile.set(file);
      } else {
        this.message.error('Por favor, selecione apenas arquivos PDF');
      }
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer?.files;
    if (files?.length) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        this.selectedFile.set(file);
      } else {
        this.message.error('Por favor, selecione apenas arquivos PDF');
      }
    }
  }

  async uploadFile(): Promise<void> {
    const file = this.selectedFile();
    if (!file) return;

    try {
      this.isLoading.set(true);
      // O path pode ser customizado baseado nas necessidades do negócio
      // Por exemplo: /clientes/{clienteId}/documentos/{ano}/{mes}
      const path = 'documentos';
      const url = await this.storageService.uploadFile(file, path);
      
      this.message.success('Documento enviado com sucesso!');
      this.clearSelection();
    } catch (error) {
      console.error('Erro ao enviar documento:', error);
      this.message.error('Erro ao enviar documento. Tente novamente.');
    } finally {
      this.isLoading.set(false);
    }
  }

  clearSelection(): void {
    this.selectedFile.set(null);
  }
} 