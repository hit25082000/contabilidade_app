import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnviarDocumentoComponent } from '../../../shared/components/documentos/enviar-documento.component';
import { ListarDocumentosComponent } from '../../../shared/components/documentos/listar-documentos.component';

/**
 * Página de documentos do cliente
 * Contém as funcionalidades relacionadas a documentos
 */
@Component({
  selector: 'app-documentos',
  standalone: true,
  imports: [
    CommonModule,
    EnviarDocumentoComponent,
    ListarDocumentosComponent
  ],
  template: `
    <div class="documentos-container">
      <!-- Seção de envio de documentos -->
      <app-enviar-documento></app-enviar-documento>
      
      <!-- Seção de listagem de documentos -->
      <app-listar-documentos></app-listar-documentos>
    </div>
  `,
  styles: [`
    .documentos-container {
      display: grid;
      gap: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    @media (max-width: 400px) {
      .documentos-container {
        gap: 16px;
      }
    }
  `]
})
export class DocumentosPage {} 