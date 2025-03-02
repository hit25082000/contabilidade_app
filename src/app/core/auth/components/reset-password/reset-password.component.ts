import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../service/auth.store';
import { AuthService } from '../../service/auth.service';

// Importações do NG-ZORRO
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzResultModule } from 'ng-zorro-antd/result';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterLink,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzAlertModule,
    NzIconModule,
    NzGridModule,
    NzSpinModule,
    NzResultModule
  ],
  template: `
    <div class="reset-container">
      <div nz-row nzJustify="center" nzAlign="middle" class="h-100">
        <div nz-col>
          <nz-card [nzBordered]="false" class="reset-card">
            <div class="logo-container">
              <span nz-icon nzType="audit" nzTheme="outline" class="logo-icon"></span>
              <h1 class="app-name">Contabilidade App</h1>
            </div>
            
            <ng-container *ngIf="!resetSuccess; else successTemplate">
              <h2 class="reset-title">Recuperar Senha</h2>
              <p class="reset-subtitle">Informe seu email para receber instruções de recuperação</p>
              
              <nz-alert 
                *ngIf="error()" 
                nzType="error" 
                [nzMessage]="error()" 
                nzShowIcon
                class="mb-4">
              </nz-alert>
              
              <form nz-form [formGroup]="resetForm" (ngSubmit)="onSubmit()">
                <nz-form-item>
                  <nz-form-control nzErrorTip="Por favor, insira um email válido">
                    <nz-input-group nzPrefixIcon="mail">
                      <input 
                        type="email" 
                        nz-input 
                        formControlName="email" 
                        placeholder="Email" 
                      />
                    </nz-input-group>
                  </nz-form-control>
                </nz-form-item>
                
                <button 
                  nz-button 
                  nzType="primary" 
                  nzBlock 
                  [nzLoading]="isLoading()" 
                  [disabled]="resetForm.invalid"
                  class="reset-button">
                  Enviar Instruções
                </button>
                
                <div class="login-link">
                  Lembrou sua senha? <a routerLink="/auth/login">Voltar para login</a>
                </div>
              </form>
            </ng-container>
            
            <ng-template #successTemplate>
              <nz-result
                nzStatus="success"
                nzTitle="Email enviado com sucesso!"
                nzSubTitle="Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.">
                <div nz-result-extra>
                  <button nz-button nzType="primary" routerLink="/auth/login">Voltar para Login</button>
                </div>
              </nz-result>
            </ng-template>
          </nz-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reset-container {
      min-height: 100vh;
      background-color: #f0f2f5;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    
    .h-100 {
      height: 100%;
    }
    
    .reset-card {
      width: 100%;
      max-width: 400px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
      padding: 24px;
    }
    
    .logo-container {
      text-align: center;
      margin-bottom: 24px;
    }
    
    .logo-icon {
      font-size: 48px;
      color: #1890ff;
      margin-bottom: 8px;
    }
    
    .app-name {
      font-size: 24px;
      color: rgba(0, 0, 0, 0.85);
      margin-bottom: 0;
    }
    
    .reset-title {
      font-size: 24px;
      color: rgba(0, 0, 0, 0.85);
      font-weight: 600;
      text-align: center;
      margin-bottom: 8px;
    }
    
    .reset-subtitle {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.45);
      text-align: center;
      margin-bottom: 40px;
    }
    
    .reset-button {
      height: 40px;
      font-size: 16px;
      margin-bottom: 24px;
    }
    
    .login-link {
      text-align: center;
      font-size: 14px;
    }
    
    .mb-4 {
      margin-bottom: 16px;
    }
    
    /* Ajustes para telas pequenas */
    @media (max-width: 480px) {
      .reset-card {
        padding: 16px;
      }
      
      .reset-title {
        font-size: 20px;
      }
      
      .app-name {
        font-size: 20px;
      }
      
      .logo-icon {
        font-size: 36px;
      }
      
      .reset-subtitle {
        margin-bottom: 24px;
      }
    }
  `]
})
export class ResetPasswordComponent {
  private authService = inject(AuthService);  
  private authStore = inject(AuthStore);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  
  resetForm: FormGroup;
  resetSuccess = false;
  
  // Signals do AuthStore
  isLoading = this.authStore.isLoading;
  error = this.authStore.error;
  
  constructor() {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }
  
  onSubmit() {
    // Retorna se o formulário for inválido
    if (this.resetForm.invalid) {
      Object.values(this.resetForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }
    
    const { email } = this.resetForm.value;
    
    this.authService.resetPassword(email).subscribe({
      next: () => {
        this.resetSuccess = true;
      },
      error: () => {
        // O erro já é tratado pelo serviço e armazenado no store
      }
    });
  }
} 