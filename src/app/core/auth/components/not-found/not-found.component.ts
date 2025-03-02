import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Importações do NG-ZORRO
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NzResultModule,
    NzButtonModule
  ],
  template: `
    <div class="error-container">
      <nz-result
        nzStatus="404"
        nzTitle="404"
        nzSubTitle="Desculpe, a página que você visitou não existe.">
        <div nz-result-extra>
          <button nz-button nzType="primary" routerLink="/">Voltar para Home</button>
        </div>
      </nz-result>
    </div>
  `,
  styles: [`
    .error-container {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    
    /* Ajustes para telas pequenas */
    @media (max-width: 480px) {
      :host ::ng-deep .ant-result-title {
        font-size: 24px;
      }
      
      :host ::ng-deep .ant-result-subtitle {
        font-size: 14px;
      }
    }
  `]
})
export class NotFoundComponent {} 