import { computed, inject, Injectable, signal } from '@angular/core';
import { from, Observable } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop';
import { DatabaseService } from '../../core/services/database.service';
import { IPlantao } from '../models/plantao.model';
import { AuthStore } from '../../core/auth/service/auth.store';

/**
 * Serviço responsável por gerenciar os plantões
 * @class PlantaoService
 */
@Injectable({
  providedIn: 'root'
})
export class PlantaoService {
  // Injeção de dependências
  private database = inject(DatabaseService);
  private authStore = inject(AuthStore);
  
  // Nome da tabela no Supabase
  private table = signal('plantoes');
  
  // Signal para armazenar o ID do plantão selecionado
  private selectedPlantaoId = signal<string | null>(null);

  // Resource para carregar todos os plantões do usuário atual
  private plantoesResource = rxResource({
    loader: () => this.getPlantoesByUserId(this.authStore.user()?.id || '')
  });

  // Resource para carregar um plantão específico
  private plantaoResource = rxResource({
    request: () => this.selectedPlantaoId(),
    loader: ({request: plantaoId}) => 
      plantaoId ? this.getPlantaoById(plantaoId) : from([null])
  });

  // Signals computados para expor os dados
  plantoes = computed(() => this.plantoesResource.value() ?? []);
  plantao = computed(() => this.plantaoResource.value());
  isLoading = computed(() => this.plantoesResource.isLoading() || this.plantaoResource.isLoading());
  error = computed(() => this.plantoesResource.error() || this.plantaoResource.error());

  constructor() { }

  /**
   * Recarrega a lista de plantões
   */
  reloadPlantoes(): void {
    this.plantoesResource.reload();
  }

  /**
   * Define o plantão selecionado
   * @param id - ID do plantão
   */
  setSelectedPlantao(id: string | null): void {
    this.selectedPlantaoId.set(id);
  }

  /**
   * Obtém um plantão pelo ID
   * @param id - ID do plantão
   * @returns Observable com o plantão
   */
  private getPlantaoById(id: string): Observable<IPlantao | null> {
    return from(this.database.getByID(this.table(), id));
  }

  /**
   * Obtém todos os plantões de um usuário
   * @param userId - ID do usuário
   * @returns Observable com a lista de plantões
   */
  private getPlantoesByUserId(userId: string): Observable<IPlantao[]> {
    return from(
      this.database.supabase
        .from(this.table())
        .select('*')
        .eq('user_id', userId)
        .order('data', { ascending: false })
        .then(({ data, error }) => {
          if (error) throw error;
          return data || [];
        })
    );
  }

  /**
   * Cria um novo plantão
   * @param plantao - Dados do plantão
   * @returns Observable com o plantão criado
   */
  createPlantao(plantao: Omit<IPlantao, 'id' | 'created_at' | 'updated_at'>): Observable<IPlantao> {
    const userId = this.authStore.user()?.id;
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }

    const newPlantao = {
      ...plantao,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return from(
      this.database.supabase
        .from(this.table())
        .insert(newPlantao)
        .select()
        .single()
        .then(({ data, error }) => {
          if (error) throw error;
          this.reloadPlantoes();
          return data;
        })
    );
  }

  /**
   * Atualiza um plantão existente
   * @param id - ID do plantão
   * @param plantao - Dados atualizados do plantão
   * @returns Observable com o plantão atualizado
   */
  updatePlantao(id: string, plantao: Partial<IPlantao>): Observable<IPlantao> {
    const updatedPlantao = {
      ...plantao,
      updated_at: new Date().toISOString()
    };

    return from(
      this.database.supabase
        .from(this.table())
        .update(updatedPlantao)
        .eq('id', id)
        .select()
        .single()
        .then(({ data, error }) => {
          if (error) throw error;
          this.reloadPlantoes();
          return data;
        })
    );
  }

  /**
   * Remove um plantão
   * @param id - ID do plantão
   * @returns Observable com o resultado da operação
   */
  deletePlantao(id: string): Observable<void> {
    return from(
      this.database.supabase
        .from(this.table())
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) throw error;
          this.reloadPlantoes();
        })
    );
  }
} 