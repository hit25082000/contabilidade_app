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
  selector: 'app-new-password',
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
    <div class="new-password-container">
      <div nz-row nzJustify="center" nzAlign="middle" class="h-100">
        <div nz-col>
          <nz-card [nzBordered]="false" class="new-password-card">
            <div class="logo-container">
              <span nz-icon nzType="audit" nzTheme="outline" class="logo-icon"></span>
              <h1 class="app-name">Contabilidade App</h1>
            </div>
            
            <ng-container *ngIf="!updateSuccess; else successTemplate">
              <h2 class="new-password-title">Definir Nova Senha</h2>
              <p class="new-password-subtitle">Crie uma nova senha para sua conta</p>
              
              <nz-alert 
                *ngIf="error()" 
                nzType="error" 
                [nzMessage]="error()" 
                nzShowIcon
                class="mb-4">
              </nz-alert>
              
              <form nz-form [formGroup]="passwordForm" (ngSubmit)="onSubmit()">
                <nz-form-item>
                  <nz-form-control nzErrorTip="A senha deve ter pelo menos 6 caracteres">
                    <nz-input-group nzPrefixIcon="lock">
                      <input 
                        [type]="passwordVisible ? 'text' : 'password'" 
                        nz-input 
                        formControlName="password" 
                        placeholder="Nova Senha" 
                      />
                      <span nz-icon 
                        [nzType]="passwordVisible ? 'eye-invisible' : 'eye'" 
                        class="password-icon"
                        (click)="passwordVisible = !passwordVisible">
                      </span>
                    </nz-input-group>
                  </nz-form-control>
                </nz-form-item>
                
                <nz-form-item>
                  <nz-form-control nzErrorTip="As senhas não coincidem">
                    <nz-input-group nzPrefixIcon="lock">
                      <input 
                        [type]="confirmPasswordVisible ? 'text' : 'password'" 
                        nz-input 
                        formControlName="confirmPassword" 
                        placeholder="Confirmar Nova Senha" 
                      />
                      <span nz-icon 
                        [nzType]="confirmPasswordVisible ? 'eye-invisible' : 'eye'" 
                        class="password-icon"
                        (click)="confirmPasswordVisible = !confirmPasswordVisible">
                      </span>
                    </nz-input-group>
                  </nz-form-control>
                </nz-form-item>
                
                <button 
                  nz-button 
                  nzType="primary" 
                  nzBlock 
                  [nzLoading]="isLoading()" 
                  [disabled]="passwordForm.invalid"
                  class="update-button">
                  Atualizar Senha
                </button>
              </form>
            </ng-container>
            
            <ng-template #successTemplate>
              <nz-result
                nzStatus="success"
                nzTitle="Senha atualizada com sucesso!"
                nzSubTitle="Sua senha foi alterada. Agora você pode fazer login com sua nova senha.">
                <div nz-result-extra>
                  <button nz-button nzType="primary" routerLink="/auth/login">Ir para Login</button>
                </div>
              </nz-result>
            </ng-template>
          </nz-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .new-password-container {
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
    
    .new-password-card {
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
    
    .new-password-title {
      font-size: 24px;
      color: rgba(0, 0, 0, 0.85);
      font-weight: 600;
      text-align: center;
      margin-bottom: 8px;
    }
    
    .new-password-subtitle {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.45);
      text-align: center;
      margin-bottom: 40px;
    }
    
    .update-button {
      height: 40px;
      font-size: 16px;
      margin-bottom: 24px;
    }
    
    .password-icon {
      cursor: pointer;
      color: #999;
    }
    
    .mb-4 {
      margin-bottom: 16px;
    }
    
    /* Ajustes para telas pequenas */
    @media (max-width: 480px) {
      .new-password-card {
        padding: 16px;
      }
      
      .new-password-title {
        font-size: 20px;
      }
      
      .app-name {
        font-size: 20px;
      }
      
      .logo-icon {
        font-size: 36px;
      }
      
      .new-password-subtitle {
        margin-bottom: 24px;
      }
    }
  `]
})
export class NewPasswordComponent {
  private authService = inject(AuthService);  
  private authStore = inject(AuthStore);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  
  passwordForm: FormGroup;
  updateSuccess = false;
  passwordVisible = false;
  confirmPasswordVisible = false;
  
  // Signals do AuthStore
  isLoading = this.authStore.isLoading;
  error = this.authStore.error;
  
  constructor() {
    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }
  
  // Validador personalizado para verificar se as senhas coincidem
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    
    return null;
  }
  
  onSubmit() {
    // Retorna se o formulário for inválido
    if (this.passwordForm.invalid) {
      Object.values(this.passwordForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }
    
    const { password } = this.passwordForm.value;
    
    this.authService.updatePassword(password).subscribe({
      next: () => {
        this.updateSuccess = true;
      },
      error: () => {
        // O erro já é tratado pelo serviço e armazenado no store
      }
    });
  }
} 