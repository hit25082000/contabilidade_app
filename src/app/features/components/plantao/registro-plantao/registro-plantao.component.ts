import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// NG-ZORRO
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';

// Serviços e modelos
import { PlantaoService } from '../../../services/plantao.service';
import { AuthStore } from '../../../../core/auth/service/auth.store';
import { IPlantao } from '../../../models/plantao.model';

/**
 * Componente para registro de plantão
 * @class RegistroPlantaoComponent
 */
@Component({
  selector: 'app-registro-plantao',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzDatePickerModule,
    NzTimePickerModule,
    NzSelectModule,
    NzSpinModule,
    NzCardModule,
    NzDividerModule,
    NzGridModule,
    NzIconModule
  ],
  template: `
    <div class="container">
      <nz-card class="plantao-card">
        <div class="page-header">
          <h1>Registro de Plantão</h1>
          <p>Registre as informações do seu plantão</p>
        </div>
        
        <nz-divider></nz-divider>
        
        <div *ngIf="isLoading()" class="loading-container">
          <nz-spin nzTip="Carregando..."></nz-spin>
        </div>
        
        <form *ngIf="!isLoading()" [formGroup]="plantaoForm" (ngSubmit)="onSubmit()" class="plantao-form">
          <nz-form-item>
            <nz-form-label [nzSpan]="24" nzRequired>Data do Plantão</nz-form-label>
            <nz-form-control [nzSpan]="24" nzErrorTip="Por favor, selecione a data do plantão!">
              <nz-date-picker 
                formControlName="data" 
                [nzFormat]="'dd/MM/yyyy'"
                nzPlaceHolder="Selecione a data"
                class="full-width">
              </nz-date-picker>
            </nz-form-control>
          </nz-form-item>
          
          <div nz-row [nzGutter]="16">
            <div nz-col [nzXs]="24" [nzSm]="12">
              <nz-form-item>
                <nz-form-label [nzSpan]="24" nzRequired>Horário de Início</nz-form-label>
                <nz-form-control [nzSpan]="24" nzErrorTip="Por favor, selecione o horário de início!">
                  <nz-time-picker 
                    formControlName="horario_inicio" 
                    [nzFormat]="'HH:mm'"
                    nzPlaceHolder="Horário inicial"
                    class="full-width">
                  </nz-time-picker>
                </nz-form-control>
              </nz-form-item>
            </div>
            
            <div nz-col [nzXs]="24" [nzSm]="12">
              <nz-form-item>
                <nz-form-label [nzSpan]="24" nzRequired>Horário de Término</nz-form-label>
                <nz-form-control [nzSpan]="24" nzErrorTip="Por favor, selecione o horário de término!">
                  <nz-time-picker 
                    formControlName="horario_fim" 
                    [nzFormat]="'HH:mm'"
                    nzPlaceHolder="Horário final"
                    class="full-width">
                  </nz-time-picker>
                </nz-form-control>
              </nz-form-item>
            </div>
          </div>
          
          <nz-form-item>
            <nz-form-label [nzSpan]="24" nzRequired>Hospital</nz-form-label>
            <nz-form-control [nzSpan]="24" nzErrorTip="Por favor, informe o hospital!">
              <input 
                nz-input 
                formControlName="hospital" 
                placeholder="Nome do hospital" />
            </nz-form-control>
          </nz-form-item>
          
          <nz-form-item>
            <nz-form-label [nzSpan]="24">Setor</nz-form-label>
            <nz-form-control [nzSpan]="24">
              <input 
                nz-input 
                formControlName="setor" 
                placeholder="Setor ou departamento (opcional)" />
            </nz-form-control>
          </nz-form-item>
          
          <nz-form-item>
            <nz-form-label [nzSpan]="24">Observações</nz-form-label>
            <nz-form-control [nzSpan]="24">
              <textarea 
                nz-input 
                formControlName="observacoes" 
                placeholder="Observações adicionais (opcional)"
                [nzAutosize]="{ minRows: 3, maxRows: 5 }">
              </textarea>
            </nz-form-control>
          </nz-form-item>
          
          <div class="form-actions">
            <button 
              nz-button 
              nzType="default" 
              type="button" 
              (click)="cancelar()">
              Cancelar
            </button>
            <button 
              nz-button 
              nzType="primary" 
              type="submit" 
              [disabled]="plantaoForm.invalid || isSaving()">
              <span *ngIf="isSaving()">Salvando...</span>
              <span *ngIf="!isSaving()">Salvar Plantão</span>
            </button>
          </div>
        </form>
      </nz-card>
    </div>
  `,
  styles: [`
    .container {
      padding: 16px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .plantao-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
    }
    
    .page-header {
      margin-bottom: 16px;
    }
    
    .page-header h1 {
      margin-bottom: 8px;
      font-size: 24px;
      font-weight: 500;
    }
    
    .page-header p {
      color: rgba(0, 0, 0, 0.45);
      margin-bottom: 0;
    }
    
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
    }
    
    .plantao-form {
      margin-top: 16px;
    }
    
    .full-width {
      width: 100%;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }
    
    /* Responsividade para telas pequenas */
    @media (max-width: 576px) {
      .container {
        padding: 12px;
      }
      
      .plantao-card {
        border-radius: 4px;
      }
      
      .page-header h1 {
        font-size: 20px;
      }
      
      .form-actions {
        flex-direction: column-reverse;
        gap: 8px;
      }
      
      .form-actions button {
        width: 100%;
      }
    }
    
    /* Responsividade para telas muito pequenas */
    @media (max-width: 400px) {
      .container {
        padding: 8px;
      }
      
      .plantao-card {
        box-shadow: none;
        border: none;
      }
      
      nz-form-item {
        margin-bottom: 16px;
      }
    }
  `]
})
export class RegistroPlantaoComponent implements OnInit {
  // Injeção de dependências
  private fb = inject(FormBuilder);
  private plantaoService = inject(PlantaoService);
  private authStore = inject(AuthStore);
  private message = inject(NzMessageService);
  private router = inject(Router);
  
  // Signals
  isLoading = signal(false);
  isSaving = signal(false);
  
  // Formulário
  plantaoForm!: FormGroup;
  
  ngOnInit(): void {
    // Verifica se o usuário está autenticado e é um cliente
    if (!this.authStore.isAuthenticated() || !this.authStore.isCliente()) {
      this.message.error('Acesso não autorizado. Apenas clientes podem registrar plantões.');
      this.router.navigate(['/']);
      return;
    }
    
    // Inicializa o formulário
    this.initForm();
  }
  
  /**
   * Inicializa o formulário com validadores
   */
  private initForm(): void {
    this.plantaoForm = this.fb.group({
      data: [null, Validators.required],
      horario_inicio: [null, Validators.required],
      horario_fim: [null, Validators.required],
      hospital: [null, Validators.required],
      setor: [null],
      observacoes: [null]
    });
  }
  
  /**
   * Manipula o envio do formulário
   */
  onSubmit(): void {
    if (this.plantaoForm.invalid) {
      // Marca todos os campos como touched para mostrar os erros
      Object.values(this.plantaoForm.controls).forEach(control => {
        control.markAsTouched();
        control.updateValueAndValidity();
      });
      return;
    }
    
    this.isSaving.set(true);
    
    // Formata os dados do formulário
    const formData = this.plantaoForm.value;
    const plantaoData: Omit<IPlantao, 'id' | 'created_at' | 'updated_at'> = {
      user_id: this.authStore.user()?.id || '',
      data: this.formatDate(formData.data),
      horario_inicio: this.formatTime(formData.horario_inicio),
      horario_fim: this.formatTime(formData.horario_fim),
      hospital: formData.hospital,
      setor: formData.setor,
      observacoes: formData.observacoes
    };
    
    // Salva o plantão
    this.plantaoService.createPlantao(plantaoData).subscribe({
      next: (response) => {
        this.message.success('Plantão registrado com sucesso!');
        this.isSaving.set(false);
        this.router.navigate(['/plantoes']);
      },
      error: (error) => {
        console.error('Erro ao registrar plantão:', error);
        this.message.error('Erro ao registrar plantão. Por favor, tente novamente.');
        this.isSaving.set(false);
      }
    });
  }
  
  /**
   * Cancela o registro e volta para a lista de plantões
   */
  cancelar(): void {
    this.router.navigate(['/plantoes']);
  }
  
  /**
   * Formata a data para o formato ISO
   * @param date - Data a ser formatada
   * @returns Data formatada
   */
  private formatDate(date: Date): string {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  }
  
  /**
   * Formata o horário para o formato HH:MM
   * @param time - Horário a ser formatado
   * @returns Horário formatado
   */
  private formatTime(time: Date): string {
    if (!time) return '';
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
} 