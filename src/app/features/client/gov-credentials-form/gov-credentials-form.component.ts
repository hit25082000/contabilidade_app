import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IDecryptedCredential, GovPortalType } from '../../../core/models/gov-credentials.model';
import { GovCredentialsService } from '../../../core/services/gov-credentials.service';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { GovCredentialsHelpComponent } from '../../../shared/components/gov-credentials-help/gov-credentials-help.component';
import { AuthService } from '../../../core/auth/service/auth.service';
import { AuthStore } from '../../../core/auth/service/auth.store';

/**
 * Componente para cliente adicionar ou editar suas credenciais governamentais
 * Implementa formulário para entrada segura de dados sensíveis
 */
@Component({
  selector: 'app-gov-credentials-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive,
    GovCredentialsHelpComponent
  ],
  template: `
    <div class="credentials-form-container">
      <h2>{{ isEditMode ? 'Atualizar' : 'Adicionar' }} Credenciais Governamentais</h2>
      <p class="security-info">
        <strong>Informação de Segurança:</strong> Suas credenciais serão criptografadas e só poderão ser acessadas pelo seu contador.
        Todos os acessos serão registrados para sua segurança.
      </p>
      
      <!-- Componente de ajuda -->
      <app-gov-credentials-help contextType="form"></app-gov-credentials-help>
      
      <div class="error-alert" *ngIf="errorMessage">
        <span class="error-icon">⚠️</span>
        {{ errorMessage }}
      </div>
      
      <form [formGroup]="credentialForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="portal">Portal Governamental</label>
          <select id="portal" formControlName="portal" class="form-control">
            <option value="">Selecione um portal</option>
            <option *ngFor="let portal of availablePortals | keyvalue" [value]="portal.value">
              {{ portal.value }}
            </option>
          </select>
          <div *ngIf="isFieldInvalid('portal')" class="error-message">
            Portal é obrigatório
          </div>
        </div>
        
        <div class="form-group" *ngIf="customPortal">
          <label for="customPortal">Nome do Portal</label>
          <input type="text" id="customPortal" formControlName="customPortal" class="form-control">
          <div *ngIf="isFieldInvalid('customPortal')" class="error-message">
            Nome do portal é obrigatório
          </div>
        </div>
        
        <div class="form-group">
          <label for="credential_name">Nome da Credencial</label>
          <input type="text" id="credential_name" formControlName="credential_name" placeholder="Ex: e-CAC (CPF: XXX.XXX.XXX-XX)" class="form-control">
          <div *ngIf="isFieldInvalid('credential_name')" class="error-message">
            Nome da credencial é obrigatório
          </div>
        </div>
        
        <div class="form-group">
          <label for="email">Email / Login</label>
          <input type="email" id="email" formControlName="email" class="form-control">
          <div *ngIf="isFieldInvalid('email')" class="error-message">
            Email/Login é obrigatório
          </div>
        </div>
        
        <div class="form-group">
          <label for="password">Senha</label>
          <div class="password-container">
            <input [type]="hidePassword ? 'password' : 'text'" id="password" formControlName="password" class="form-control">
            <button type="button" class="password-toggle" (click)="togglePasswordVisibility()">
              {{ hidePassword ? 'Mostrar' : 'Ocultar' }}
            </button>
          </div>
          <div *ngIf="isFieldInvalid('password')" class="error-message">
            Senha é obrigatória
          </div>
        </div>
        
        <div class="form-group">
          <label for="expiration_date">Data de Expiração (Opcional)</label>
          <input type="date" id="expiration_date" formControlName="expiration_date" class="form-control">
        </div>
        
        <div class="form-group">
          <label for="notes">Observações (Opcional)</label>
          <textarea id="notes" formControlName="notes" rows="3" class="form-control"
            placeholder="Informações adicionais como código de acesso, perguntas de segurança, etc."></textarea>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn-cancel" (click)="onCancel()">Cancelar</button>
          <button type="submit" class="btn-save" [disabled]="credentialForm.invalid || isSubmitting">
            {{ isSubmitting ? 'Salvando...' : (isEditMode ? 'Atualizar' : 'Salvar') }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .credentials-form-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    h2 {
      color: #333;
      margin-bottom: 20px;
      text-align: center;
    }
    
    .security-info {
      background-color: #e8f5e9;
      padding: 12px;
      border-radius: 4px;
      font-size: 14px;
      margin-bottom: 20px;
      border-left: 4px solid #43a047;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #555;
    }
    
    .form-control {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
      transition: border-color 0.3s;
    }
    
    .form-control:focus {
      border-color: #2196f3;
      outline: none;
      box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
    }
    
    .password-container {
      display: flex;
    }
    
    .password-container .form-control {
      flex: 1;
      border-right: none;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
    
    .password-toggle {
      background-color: #f5f5f5;
      border: 1px solid #ddd;
      border-left: none;
      padding: 0 12px;
      cursor: pointer;
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
      font-size: 14px;
    }
    
    .error-message {
      color: #d32f2f;
      font-size: 12px;
      margin-top: 4px;
    }
    
    .form-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
    }
    
    .btn-cancel, .btn-save {
      padding: 10px 24px;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      font-size: 16px;
      transition: background-color 0.3s;
    }
    
    .btn-cancel {
      background-color: #f5f5f5;
      color: #555;
    }
    
    .btn-save {
      background-color: #2196f3;
      color: white;
    }
    
    .btn-save:hover {
      background-color: #1976d2;
    }
    
    .btn-cancel:hover {
      background-color: #e0e0e0;
    }
    
    .btn-save:disabled {
      background-color: #bbdefb;
      cursor: not-allowed;
    }
    
    @media (max-width: 600px) {
      .credentials-form-container {
        padding: 16px;
        box-shadow: none;
        border-radius: 0;
      }
      
      .form-actions {
        flex-direction: column;
        gap: 10px;
      }
      
      .btn-cancel, .btn-save {
        width: 100%;
      }
    }
    
    .error-alert {
      background-color: #ffebee;
      color: #c62828;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 20px;
      border-left: 4px solid #c62828;
      display: flex;
      align-items: center;
    }
    
    .error-icon {
      margin-right: 8px;
      font-size: 18px;
    }
  `]
})
export class GovCredentialsFormComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private govCredentialsService = inject(GovCredentialsService);
  private authStore = inject(AuthStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  credentialForm!: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  credentialId: string | null = null;
  hidePassword = true;
  userId = ""
  // Mensagem de erro para exibir ao usuário
  errorMessage: string | null = null;
  
  // Lista de portais disponíveis para seleção
  availablePortals = GovPortalType;
  
  get customPortal(): boolean {
    return this.credentialForm?.get('portal')?.value === GovPortalType.OUTRO;
  }
  
  ngOnInit(): void {
    // Inicializar formulário
    this.initForm();
    
    // Verificar se estamos em modo de edição
    this.route.paramMap.subscribe(params => {
      this.credentialId = params.get('id');
      this.isEditMode = !!this.credentialId;
      
      if (this.isEditMode && this.credentialId) {
        this.loadCredential(this.credentialId);
      }
    });
    
    this.userId = this.authStore.user()?.id!    
  }
  
  /**
   * Inicializa o formulário com validações
   */
  initForm(): void {
    this.credentialForm = this.formBuilder.group({
      portal: ['', Validators.required],
      customPortal: [''],
      credential_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      expiration_date: [''],
      notes: ['']
    });
    
    // Adicionar validação condicional para portal customizado
    this.credentialForm.get('portal')?.valueChanges.subscribe(value => {
      const customPortalControl = this.credentialForm.get('customPortal');
      if (value === GovPortalType.OUTRO) {
        customPortalControl?.setValidators([Validators.required]);
      } else {
        customPortalControl?.clearValidators();
      }
      customPortalControl?.updateValueAndValidity();
    });
  }
  
  /**
   * Carrega os dados da credencial para edição
   */
  async loadCredential(id: string): Promise<void> {
    try {
      // Em um aplicativo real, esta lógica seria diferente
      // Um cliente não deveria poder descriptografar suas próprias credenciais
      // Este é um exemplo simplificado para o propósito do componente
      
      // Buscar credenciais no serviço
      const credentials = await this.govCredentialsService.getCredential(id);
      const credential = credentials.find(c => c.id === id);
      
      if (!credential) {
        console.error('Credencial não encontrada');
        this.router.navigate(['/cliente/credenciais']);
        return;
      }
      
      // Neste exemplo, apenas preenchemos o nome da credencial
      // Em um app real, você não conseguiria descriptografar os dados
      this.credentialForm.patchValue({
        credential_name: credential.credential_name
      });
      
      // Adicionar lógica para preencher outros campos se necessário
    } catch (error) {
      console.error('Erro ao carregar credencial:', error);
    }
  }
  
  /**
   * Verifica se um campo do formulário é inválido
   */
  isFieldInvalid(field: string): boolean {
    const control = this.credentialForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
  
  /**
   * Alterna a visibilidade da senha
   */
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
  
  /**
   * Manipula o envio do formulário
   */
  async onSubmit(): Promise<void> {
    if (this.credentialForm.invalid) {
      // Marcar todos os campos como touched para mostrar erros
      Object.keys(this.credentialForm.controls).forEach(key => {
        const control = this.credentialForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    this.isSubmitting = true;
    this.errorMessage = null;
    
    try {
      // Verificar se o userId está definido
      if (!this.userId) {
        console.error('ID do usuário não definido');
        this.errorMessage = 'Erro de autenticação. Por favor, tente novamente mais tarde.';
        return;
      }
      
      // Preparar dados da credencial
      const formValues = this.credentialForm.value;
      
      // Determinar o nome do portal
      const portalName = formValues.portal === GovPortalType.OUTRO
        ? formValues.customPortal
        : formValues.portal;
      
      // Criar objeto de credencial
      const credential: IDecryptedCredential = {
        email: formValues.email,
        password: formValues.password,
        portal: portalName,
        notes: formValues.notes || undefined,
        expiration_date: formValues.expiration_date || undefined
      };
      
      console.log('Enviando dados para salvar credencial do usuário:', this.userId);
      
      if (this.isEditMode && this.credentialId) {
        // Atualizar credencial existente
        await this.govCredentialsService.updateCredential(
          this.credentialId,
          credential,
          this.userId
        );
        console.log('Credencial atualizada com sucesso');
      } else {
        // Criar nova credencial
        await this.govCredentialsService.saveCredential(
          this.userId,
          formValues.credential_name,
          credential
        );
        console.log('Nova credencial criada com sucesso');
      }
      
      // Redirecionar para lista de credenciais
      this.router.navigate(['/cliente/credenciais']);
    } catch (error) {
      console.error('Erro ao salvar credencial:', error);
      this.errorMessage = 'Ocorreu um erro ao salvar suas credenciais. Por favor, tente novamente.';
      
      // Exibir detalhes do erro no console
      if (error instanceof Error) {
        console.error('Detalhes do erro:', error.message);
      }
    } finally {
      this.isSubmitting = false;
    }
  }
  
  /**
   * Cancela a operação e volta para a lista
   */
  onCancel(): void {
    this.router.navigate(['/cliente/credenciais']);
  }
} 