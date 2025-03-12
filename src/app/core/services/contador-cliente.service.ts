import { Injectable, inject } from '@angular/core';
import { DatabaseService } from './database.service';
import { IUser } from '../auth/models/user.interface';

/**
 * Interface para a relação entre contador e cliente
 */
export interface IContadorCliente {
  id?: number;
  contador_id: string;
  cliente_id: string;
  created_at?: string;
}

/**
 * Serviço responsável por gerenciar a relação entre contadores e clientes
 * Permite vincular e desvincular clientes a um contador
 */
@Injectable({
  providedIn: 'root'
})
export class ContadorClienteService {
  private databaseService = inject(DatabaseService);

  /**
   * Obtém todos os clientes vinculados a um contador
   * @param contadorId - ID do contador
   * @returns Lista de clientes vinculados ao contador
   */
  async getClientesByContador(contadorId: string): Promise<IUser[]> {
    try {
      // Busca as relações contador-cliente
      const { data: relacoes, error } = await this.databaseService.supabase
        .from('contador_clientes')
        .select('cliente_id')
        .eq('contador_id', contadorId);

      if (error) throw error;
      if (!relacoes || relacoes.length === 0) return [];

      // Extrai os IDs dos clientes
      const clienteIds = relacoes.map(rel => rel.cliente_id);

      // Busca os dados completos dos clientes
      const { data: clientes, error: clientesError } = await this.databaseService.supabase
        .from('profiles')
        .select('*')
        .in('id', clienteIds)
        .eq('role', 'cliente');

      if (clientesError) throw clientesError;
      return clientes || [];
    } catch (error) {
      console.error('Erro ao buscar clientes do contador:', error);
      throw error;
    }
  }

  /**
   * Obtém todos os clientes disponíveis para vinculação
   * @param contadorId - ID do contador
   * @returns Lista de clientes não vinculados ao contador
   */
  async getClientesDisponiveis(contadorId: string): Promise<IUser[]> {
    try {
      // Busca as relações contador-cliente existentes
      const { data: relacoes, error } = await this.databaseService.supabase
        .from('contador_clientes')
        .select('cliente_id')
        .eq('contador_id', contadorId);

      if (error) throw error;

      // Extrai os IDs dos clientes já vinculados
      const clientesVinculadosIds = relacoes ? relacoes.map(rel => rel.cliente_id) : [];

      // Busca todos os usuários com role 'cliente'
      const { data: todosClientes, error: clientesError } = await this.databaseService.supabase
        .from('profiles')
        .select('*')
        .eq('role', 'cliente');

      if (clientesError) throw clientesError;
      if (!todosClientes) return [];

      // Filtra os clientes que ainda não estão vinculados ao contador
      return clientesVinculadosIds.length > 0
        ? todosClientes.filter(cliente => !clientesVinculadosIds.includes(cliente.id))
        : todosClientes;
    } catch (error) {
      console.error('Erro ao buscar clientes disponíveis:', error);
      throw error;
    }
  }

  /**
   * Vincula um cliente a um contador
   * @param contadorId - ID do contador
   * @param clienteId - ID do cliente
   * @returns Resultado da operação
   */
  async vincularCliente(contadorId: string, clienteId: string): Promise<boolean> {
    try {
      const { data, error } = await this.databaseService.supabase
        .from('contador_clientes')
        .upsert([
          { contador_id: contadorId, cliente_id: clienteId, status: "ativo" }
        ]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao vincular cliente ao contador:', error);
      throw error;
    }
  }

  /**
   * Desvincula um cliente de um contador
   * @param contadorId - ID do contador
   * @param clienteId - ID do cliente
   * @returns Resultado da operação
   */
  async desvincularCliente(contadorId: string, clienteId: string): Promise<boolean> {
    try {
      const { data, error } = await this.databaseService.supabase
        .from('contador_clientes')
        .delete()
        .eq('contador_id', contadorId)
        .eq('cliente_id', clienteId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao desvincular cliente do contador:', error);
      throw error;
    }
  }
} 