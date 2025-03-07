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
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-register',
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
    NzSpinModule,
    NzSelectModule,
    NzNotificationModule
  ],
  template: `
    <div class="register-container">
      <div nz-row nzJustify="center" nzAlign="middle">
        <div nz-col [nzXs]="24" [nzSm]="24" [nzMd]="20" [nzLg]="16">
          <nz-card [nzBordered]="false" class="register-card">
            <div class="logo-container">
              <span nz-icon nzType="audit" nzTheme="outline" class="logo-icon"></span>
              <h1 class="app-name">Contabilidade App</h1>
            </div>
            
            <h2 class="register-title">Criar Conta</h2>
            <p class="register-subtitle">Preencha os dados abaixo para se cadastrar</p>
            
            <nz-alert 
              *ngIf="error()" 
              nzType="error" 
              [nzMessage]="error()" 
              nzShowIcon
              class="mb-4">
            </nz-alert>
            
            <form nz-form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
              <!-- Tipo de Perfil -->
              <nz-form-item>
                <nz-form-control nzErrorTip="Por favor, selecione seu tipo de perfil">
                  <nz-select 
                    formControlName="role" 
                    nzPlaceHolder="Selecione seu perfil"
                    class="full-width">
                    <nz-option nzValue="cliente" nzLabel="Cliente"></nz-option>
                    <nz-option nzValue="contador" nzLabel="Contador"></nz-option>
                  </nz-select>
                </nz-form-control>
              </nz-form-item>

              <!-- Nome Completo -->
              <nz-form-item>
                <nz-form-control nzErrorTip="Por favor, insira seu nome completo">
                  <nz-input-group nzPrefixIcon="user">
                    <input 
                      type="text" 
                      nz-input 
                      formControlName="nome_completo" 
                      placeholder="Nome Completo" 
                    />
                  </nz-input-group>
                </nz-form-control>
              </nz-form-item>
              
              <!-- Email -->
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
              
              <!-- CPF/CNPJ -->
              <nz-form-item>
                <nz-form-control nzErrorTip="Por favor, insira um CPF/CNPJ válido">
                  <nz-input-group nzPrefixIcon="idcard">
                    <input 
                      type="text" 
                      nz-input 
                      formControlName="cpf_cnpj" 
                      placeholder="CPF/CNPJ" 
                    />
                  </nz-input-group>
                </nz-form-control>
              </nz-form-item>
              
              <!-- Telefone -->
              <nz-form-item>
                <nz-form-control nzErrorTip="Por favor, insira um telefone válido">
                  <nz-input-group nzPrefixIcon="phone">
                    <input 
                      type="text" 
                      nz-input 
                      formControlName="telefone" 
                      placeholder="Telefone" 
                    />
                  </nz-input-group>
                </nz-form-control>
              </nz-form-item>
              
              <!-- CRC (apenas para contadores) -->
              <nz-form-item *ngIf="registerForm.get('role')?.value === 'contador'">
                <nz-form-control nzErrorTip="Por favor, insira seu registro CRC">
                  <nz-input-group nzPrefixIcon="solution">
                    <input 
                      type="text" 
                      nz-input 
                      formControlName="crc" 
                      placeholder="Registro CRC" 
                    />
                  </nz-input-group>
                </nz-form-control>
              </nz-form-item>
              
              <!-- Senha -->
              <nz-form-item>
                <nz-form-control nzErrorTip="A senha deve ter pelo menos 6 caracteres">
                  <nz-input-group [nzSuffix]="suffixPassword">
                    <input 
                      [type]="passwordVisible ? 'text' : 'password'" 
                      nz-input 
                      formControlName="password" 
                      placeholder="Senha" 
                    />
                  </nz-input-group>
                  <ng-template #suffixPassword>
                    <span nz-icon
                      [nzType]="passwordVisible ? 'eye-invisible' : 'eye'"
                      (click)="passwordVisible = !passwordVisible">
                    </span>
                  </ng-template>
                </nz-form-control>
              </nz-form-item>
              
              <!-- Confirmar Senha -->
              <nz-form-item>
                <nz-form-control nzErrorTip="As senhas não coincidem">
                  <nz-input-group [nzSuffix]="suffixConfirm">
                    <input 
                      [type]="confirmPasswordVisible ? 'text' : 'password'" 
                      nz-input 
                      formControlName="confirmPassword" 
                      placeholder="Confirmar Senha" 
                    />
                  </nz-input-group>
                  <ng-template #suffixConfirm>
                    <span nz-icon
                      [nzType]="confirmPasswordVisible ? 'eye-invisible' : 'eye'"
                      (click)="confirmPasswordVisible = !confirmPasswordVisible">
                    </span>
                  </ng-template>
                </nz-form-control>
              </nz-form-item>
              
              <!-- Termos -->
              <nz-form-item>
                <nz-form-control>
                  <label nz-checkbox formControlName="termos" class="terms-text">
                    Li e concordo com os <a href="#">Termos de Uso</a> e <a href="#">Política de Privacidade</a>
                  </label>
                </nz-form-control>
              </nz-form-item>
              
              <!-- Botão de Registro -->
              <button 
                nz-button 
                nzType="primary" 
                nzBlock 
                [nzLoading]="isLoading()" 
                [disabled]="registerForm.invalid || !registerForm.get('termos')?.value"
                class="register-button">
                Criar Conta
              </button>
              
              <!-- Link para Login -->
              <div class="login-link">
                Já tem uma conta? <a routerLink="/auth/login">Faça login</a>
              </div>
            </form>
          </nz-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      background-color: #f0f2f5;
      padding: 12px;
    }

    .register-card {
      margin: 0 auto;
      max-width: 100%;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
    }

    .logo-container {
      text-align: center;
      margin-bottom: 16px;
    }

    .logo-icon {
      font-size: 32px;
      color: #1890ff;
    }

    .app-name {
      font-size: 20px;
      color: rgba(0, 0, 0, 0.85);
      margin: 8px 0;
    }

    .register-title {
      font-size: 20px;
      text-align: center;
      margin-bottom: 4px;
    }

    .register-subtitle {
      font-size: 14px;
      text-align: center;
      color: rgba(0, 0, 0, 0.45);
      margin-bottom: 24px;
    }

    .register-form {
      max-width: 100%;
    }

    .full-width {
      width: 100%;
    }

    nz-form-item {
      margin-bottom: 16px;
    }

    .terms-text {
      font-size: 12px;
      line-height: 1.5;
      display: block;
    }

    .register-button {
      margin: 24px 0 16px;
    }

    .login-link {
      text-align: center;
      font-size: 14px;
    }

    :host ::ng-deep {
      .ant-input-prefix {
        margin-right: 8px;
      }

      .ant-form-item-explain {
        font-size: 12px;
      }

      .ant-card-body {
        padding: 16px;
      }

      .ant-input {
        padding: 4px 11px;
      }

      .ant-select-selector {
        height: 32px !important;
      }

      .ant-form-item-control-input {
        min-height: 32px;
      }
    }

    @media (max-width: 480px) {
      .register-container {
        padding: 8px;
      }

      .register-card {
        box-shadow: none;
      }

      .terms-text {
        font-size: 11px;
      }

      :host ::ng-deep {
        .ant-card-body {
          padding: 12px;
        }

        .ant-form-item {
          margin-bottom: 12px;
        }
      }
    }

    @media (min-width: 481px) {
      .register-card {
        min-width: 380px;
      }
    }
  `]
})
export class RegisterComponent {
  private authService = inject(AuthService);  
  private authStore = inject(AuthStore);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private notification = inject(NzNotificationService);
  
  registerForm: FormGroup;
  submitted = false;
  passwordVisible = false;
  confirmPasswordVisible = false;
  
  // Signals do AuthStore
  isLoading = this.authStore.isLoading;
  error = this.authStore.error;
  
  constructor() {
    this.registerForm = this.fb.group({
      nome_completo: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      cpf_cnpj: ['', [Validators.required]],
      role: ['cliente', [Validators.required]],
      telefone: ['', [Validators.required]],
      crc: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      termos: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });

    // Adicionar validador condicional para CRC quando role for contador
    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      const crcControl = this.registerForm.get('crc');
      if (role === 'contador') {
        crcControl?.setValidators([Validators.required]);
      } else {
        crcControl?.clearValidators();
      }
      crcControl?.updateValueAndValidity();
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
    this.submitted = true;
    
    // Retorna se o formulário for inválido
    if (this.registerForm.invalid) {
      Object.values(this.registerForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }
    
    const { 
      email, 
      password, 
      nome_completo, 
      cpf_cnpj, 
      role, 
      telefone, 
      crc 
    } = this.registerForm.value;
    
    // Preparar dados do usuário para registro
    const userData = {
      nome_completo,
      cpf_cnpj,
      role,
      telefone,
      metadata: {}
    };
    
    // Adicionar CRC se for contador
    if (role === 'contador' && crc) {
      userData.metadata = { crc };
    }
    
    this.authService.register(email, password, userData).subscribe({
      next: (session) => {
        // Exibe notificação de sucesso
        this.notification.success(
          'Cadastro Realizado com Sucesso',
          'Um email de ativação foi enviado para o seu endereço de email. Por favor, verifique sua caixa de entrada e siga as instruções para ativar sua conta.',
          { nzDuration: 8000 }
        );

        // Redirecionar com base na role
        if (session.user?.role === 'contador') {
          this.router.navigateByUrl('/contador');
        } else {
          this.router.navigateByUrl('/cliente');
        }
      },
      error: () => {
        // O erro já é tratado pelo serviço e armazenado no store
        this.submitted = false;
      }
    });
  }
} 