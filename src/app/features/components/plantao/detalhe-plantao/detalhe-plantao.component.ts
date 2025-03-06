import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// NG-ZORRO
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

// Serviços e modelos
import { PlantaoService } from '../../../services/plantao.service';
import { AuthStore } from '../../../../core/auth/service/auth.store';
import { IPlantao } from '../../../models/plantao.model';

/**
 * Componente para visualização detalhada de um plantão
 * @class DetalhePlantaoComponent
 */
@Component({
  selector: 'app-detalhe-plantao',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzDescriptionsModule,
    NzButtonModule,
    NzIconModule,
    NzPopconfirmModule,
    NzSpinModule,
    NzCardModule,
    NzDividerModule,
    NzGridModule,
    NzEmptyModule
  ],
  template: `
    <div class="container">
      <nz-card class="plantao-card">
        <div class="page-header">
          <div class="title-section">
            <h1>Detalhes do Plantão</h1>
            <p>Informações completas sobre o plantão</p>
          </div>
          
          <div class="actions-section">
            <button 
              nz-button 
              nzType="default" 
              (click)="voltar()">
              <span nz-icon nzType="arrow-left"></span>
              Voltar
            </button>
            
            <button 
              nz-button 
              nzType="primary" 
              nzDanger
              nz-popconfirm
              nzPopconfirmTitle="Tem certeza que deseja excluir este plantão?"
              nzPopconfirmPlacement="bottom"
              (nzOnConfirm)="excluirPlantao()">
              <span nz-icon nzType="delete"></span>
              Excluir
            </button>
          </div>
        </div>
        
        <nz-divider></nz-divider>
        
        <div *ngIf="plantaoService.isLoading()" class="loading-container">
          <nz-spin nzTip="Carregando detalhes..."></nz-spin>
        </div>
        
        <div *ngIf="!plantaoService.isLoading() && !plantaoService.plantao()" class="empty-container">
          <nz-empty 
            nzNotFoundImage="simple" 
            nzNotFoundContent="Plantão não encontrado"
            nzNotFoundFooter="O plantão solicitado não foi encontrado ou não existe">
          </nz-empty>
        </div>
        
        <div *ngIf="!plantaoService.isLoading() && plantaoService.plantao()">
          <nz-descriptions nzTitle="Informações do Plantão" nzBordered [nzColumn]="{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }">
            <nz-descriptions-item nzTitle="Data" [nzSpan]="1">
              {{ formatarData(plantaoService.plantao()?.data || '') }}
            </nz-descriptions-item>
            
            <nz-descriptions-item nzTitle="Horário" [nzSpan]="1">
              {{ plantaoService.plantao()?.horario_inicio }} - {{ plantaoService.plantao()?.horario_fim }}
            </nz-descriptions-item>
            
            <nz-descriptions-item nzTitle="Duração" [nzSpan]="1">
              {{ calcularDuracao(plantaoService.plantao()?.horario_inicio || '', plantaoService.plantao()?.horario_fim || '') }}
            </nz-descriptions-item>
            
            <nz-descriptions-item nzTitle="Hospital" [nzSpan]="3">
              {{ plantaoService.plantao()?.hospital }}
            </nz-descriptions-item>
            
            <nz-descriptions-item nzTitle="Setor" [nzSpan]="3">
              {{ plantaoService.plantao()?.setor || 'Não informado' }}
            </nz-descriptions-item>
            
            <nz-descriptions-item nzTitle="Observações" [nzSpan]="3">
              <div class="observacoes">
                {{ plantaoService.plantao()?.observacoes || 'Nenhuma observação registrada' }}
              </div>
            </nz-descriptions-item>
            
            <nz-descriptions-item nzTitle="Registrado em" [nzSpan]="3">
              {{ formatarDataHora(plantaoService.plantao()?.created_at || '') }}
            </nz-descriptions-item>
          </nz-descriptions>
        </div>
      </nz-card>
    </div>
  `,
  styles: [`
    .container {
      padding: 16px;
      max-width: 1000px;
      margin: 0 auto;
    }
    
    .plantao-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
    }
    
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 16px;
    }
    
    .title-section h1 {
      margin-bottom: 8px;
      font-size: 24px;
      font-weight: 500;
    }
    
    .title-section p {
      color: rgba(0, 0, 0, 0.45);
      margin-bottom: 0;
    }
    
    .actions-section {
      display: flex;
      gap: 12px;
    }
    
    .loading-container, .empty-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
    }
    
    .observacoes {
      white-space: pre-line;
      max-height: 150px;
      overflow-y: auto;
    }
    
    /* Responsividade para telas pequenas */
    @media (max-width: 576px) {
      .container {
        padding: 12px;
      }
      
      .plantao-card {
        border-radius: 4px;
      }
      
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
      
      .actions-section {
        width: 100%;
        justify-content: space-between;
      }
      
      .title-section h1 {
        font-size: 20px;
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
      
      :host ::ng-deep nz-descriptions-item {
        padding: 12px 8px;
      }
    }
  `]
})
export class DetalhePlantaoComponent implements OnInit {
  // Injeção de dependências
  plantaoService = inject(PlantaoService);
  private authStore = inject(AuthStore);
  private message = inject(NzMessageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  ngOnInit(): void {
    // Verifica se o usuário está autenticado e é um cliente
    if (!this.authStore.isAuthenticated() || !this.authStore.isCliente()) {
      this.message.error('Acesso não autorizado. Apenas clientes podem visualizar plantões.');
      this.router.navigate(['/']);
      return;
    }
    
    // Obtém o ID do plantão da URL
    const plantaoId = this.route.snapshot.paramMap.get('id');
    if (plantaoId) {
      this.plantaoService.setSelectedPlantao(plantaoId);
    } else {
      this.message.error('ID do plantão não fornecido.');
      this.router.navigate(['/plantoes']);
    }
  }
  
  /**
   * Formata a data para exibição
   * @param dataString - Data em formato ISO
   * @returns Data formatada
   */
  formatarData(dataString: string): string {
    if (!dataString) return '';
    
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  }
  
  /**
   * Formata a data e hora para exibição
   * @param dataString - Data e hora em formato ISO
   * @returns Data e hora formatadas
   */
  formatarDataHora(dataString: string): string {
    if (!dataString) return '';
    
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR');
  }
  
  /**
   * Calcula a duração do plantão
   * @param inicio - Horário de início
   * @param fim - Horário de término
   * @returns Duração formatada
   */
  calcularDuracao(inicio: string, fim: string): string {
    if (!inicio || !fim) return '';
    
    const [horaInicio, minInicio] = inicio.split(':').map(Number);
    const [horaFim, minFim] = fim.split(':').map(Number);
    
    let diferencaMinutos = (horaFim * 60 + minFim) - (horaInicio * 60 + minInicio);
    
    // Se a diferença for negativa, assume que o plantão passou da meia-noite
    if (diferencaMinutos < 0) {
      diferencaMinutos += 24 * 60;
    }
    
    const horas = Math.floor(diferencaMinutos / 60);
    const minutos = diferencaMinutos % 60;
    
    return `${horas}h ${minutos}min`;
  }
  
  /**
   * Exclui o plantão atual
   */
  excluirPlantao(): void {
    const plantaoId = this.plantaoService.plantao()?.id;
    if (!plantaoId) {
      this.message.error('Não foi possível excluir o plantão.');
      return;
    }
    
    this.plantaoService.deletePlantao(plantaoId).subscribe({
      next: () => {
        this.message.success('Plantão excluído com sucesso!');
        this.router.navigate(['/plantoes']);
      },
      error: (error) => {
        console.error('Erro ao excluir plantão:', error);
        this.message.error('Erro ao excluir plantão. Por favor, tente novamente.');
      }
    });
  }
  
  /**
   * Volta para a lista de plantões
   */
  voltar(): void {
    this.router.navigate(['/plantoes']);
  }
} 