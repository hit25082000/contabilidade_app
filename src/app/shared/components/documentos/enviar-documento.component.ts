import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentUploadComponent } from '../document-upload/document-upload.component';

// Importações do NG-ZORRO
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';

/**
 * Componente para envio de documentos
 * Componente filho que será renderizado dentro da página do cliente
 */
@Component({
  selector: 'app-enviar-documento',
  imports: [
    CommonModule,
    DocumentUploadComponent,
    NzCardModule,
    NzDividerModule
  ],
  template: `
    <nz-card>
      <h3 class="section-title">Enviar Documentos</h3>
      <p class="section-description">Faça upload de documentos PDF para seu contador</p>
      <nz-divider></nz-divider>
      <app-document-upload></app-document-upload>
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

    @media (max-width: 400px) {
      .section-title {
        font-size: 18px;
      }

      .section-description {
        font-size: 14px;
      }
    }
  `]
})
export class EnviarDocumentoComponent {} 