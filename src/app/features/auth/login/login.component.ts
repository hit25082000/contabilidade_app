import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AuthStore } from '../../../core/store/auth.store';

// Importações do NG-ZORRO
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterLink,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCheckboxModule,
    NzCardModule,
    NzAlertModule,
    NzIconModule,
    NzGridModule,
    NzSpinModule
  ],
  template: `
    <div class="login-container">
      <div nz-row nzJustify="center" nzAlign="middle" class="h-100">
        <div nz-col>
          <nz-card [nzBordered]="false" class="login-card">
            <div class="logo-container">
              <span nz-icon nzType="audit" nzTheme="outline" class="logo-icon"></span>
              <h1 class="app-name">Contabilidade App</h1>
            </div>
            
            <h2 class="login-title">Bem-vindo(a)</h2>
            <p class="login-subtitle">Faça login para acessar sua conta</p>
            
            <nz-alert 
              *ngIf="error()" 
              nzType="error" 
              [nzMessage]="error()" 
              nzShowIcon
              class="mb-4">
            </nz-alert>
            
            <form nz-form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
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
              
              <nz-form-item>
                <nz-form-control nzErrorTip="A senha deve ter pelo menos 6 caracteres">
                  <nz-input-group nzPrefixIcon="lock">
                    <input 
                      [type]="passwordVisible ? 'text' : 'password'" 
                      nz-input 
                      formControlName="password" 
                      placeholder="Senha" 
                    />
                    <span nz-icon 
                      [nzType]="passwordVisible ? 'eye-invisible' : 'eye'" 
                      class="password-icon"
                      (click)="passwordVisible = !passwordVisible">
                    </span>
                  </nz-input-group>
                </nz-form-control>
              </nz-form-item>
              
              <div class="login-options">
                <label nz-checkbox formControlName="remember">Lembrar-me</label>
                <a routerLink="/auth/recuperar-senha" class="forgot-link">Esqueceu a senha?</a>
              </div>
              
              <button 
                nz-button 
                nzType="primary" 
                nzBlock 
                [nzLoading]="isLoading()" 
                [disabled]="loginForm.invalid"
                class="login-button">
                Entrar
              </button>
              
              <div class="register-link">
                Não tem uma conta? <a routerLink="/auth/registro">Cadastre-se</a>
              </div>
            </form>
          </nz-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      background-color: #f0f2f5;
      display: flex;
    align-items: center;
    justify-content: center;
    }
    
    .h-100 {
      height: 100%;
    }
    
    .login-card {
      min-width: max-content;
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
    
    .login-title {
      font-size: 24px;
      color: rgba(0, 0, 0, 0.85);
      font-weight: 600;
      text-align: center;
      margin-bottom: 8px;
    }
    
    .login-subtitle {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.45);
      text-align: center;
      margin-bottom: 40px;
    }
    
    .login-options {
      display: flex;
      justify-content: space-between;
      margin-bottom: 24px;
    }
    
    .forgot-link {
      font-size: 14px;
    }
    
    .login-button {
      height: 40px;
      font-size: 16px;
      margin-bottom: 24px;
    }
    
    .register-link {
      text-align: center;
      font-size: 14px;
    }
    
    .password-icon {
      cursor: pointer;
      color: #999;
    }
    
    .mb-4 {
      margin-bottom: 16px;
    }
    
    .login-subtitle {
      margin-bottom: 24px;
    }
      .login-card {
        padding: 16px;
      }
      
      .login-title {
        font-size: 20px;
      }
      
    
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private authStore = inject(AuthStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  
  loginForm: FormGroup;
  submitted = false;
  passwordVisible = false;
  
  // Signals do AuthStore
  isLoading = this.authStore.isLoading;
  error = this.authStore.error;
  
  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false]
    });
  }
  
  onSubmit() {
    this.submitted = true;
    
    // Retorna se o formulário for inválido
    if (this.loginForm.invalid) {
      Object.values(this.loginForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }
    
    const { email, password } = this.loginForm.value;
    
    this.authService.login(email, password).subscribe({
      next: () => {
        // Redireciona para a URL de retorno ou para o dashboard
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: () => {
        // O erro já é tratado pelo serviço e armazenado no store
        this.submitted = false;
      }
    });
  }
} 