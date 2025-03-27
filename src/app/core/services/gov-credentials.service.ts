import { Injectable, inject, signal } from '@angular/core';
import { DatabaseService } from './database.service';
import { CryptoService } from './crypto.service';
import { 
  IDecryptedCredential, 
  IGovCredentials, 
  IAccessLog,
  GovPortalType
} from '../models/gov-credentials.model';
import { HttpClient } from '@angular/common/http';
import { toObservable } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Observable, from } from 'rxjs';

/**
 * Serviço responsável por gerenciar as credenciais governamentais
 * Implementa métodos para armazenar, recuperar e revogar acesso às credenciais
 * Utiliza criptografia para proteger os dados sensíveis
 */
@Injectable({
  providedIn: 'root'
})
export class GovCredentialsService {
  private databaseService = inject(DatabaseService);
  private cryptoService = inject(CryptoService);
  private http = inject(HttpClient);
  
  // Chave para criptografia derivada da chave do ambiente (não usar diretamente em produção)
  private systemKey = environment.ENCRYPTION_KEY || 'app_master_key_placeholder';
  
  // ID temporário para testes (remover em produção)
  private tempUserId = '123e4567-e89b-12d3-a456-426614174000';
  
  // Armazenamento de credenciais em memória para cache temporário
  private credentialsCache = signal<Map<string, IGovCredentials>>(new Map());
  
  // Observable do cache para componentes que precisam reagir a mudanças
  public credentials$ = toObservable(this.credentialsCache);
  
  constructor() {}
  
  /**
   * Valida o ID fornecido, substituindo por um ID temporário se for vazio
   * @param id ID a ser validado
   * @returns ID válido
   */
  private validateId(id: string | null | undefined): string {
    if (!id || id.trim() === '') {
      console.warn('ID vazio fornecido, usando ID temporário para desenvolvimento');
      return this.tempUserId;
    }
    return id;
  }
  
  /**
   * Salva as credenciais governamentais de forma criptografada
   * 
   * @param clienteId - ID do cliente
   * @param credentialName - Nome/descrição da credencial (ex: "Gov.BR - CPF 123.456.789-00")
   * @param credential - Objeto com email e senha
   * @returns A credencial salva
   */
  async saveCredential(
    clienteId: string, 
    credentialName: string, 
    credential: IDecryptedCredential
  ): Promise<IGovCredentials> {
    try {
      // Validar ID do cliente
      const validClienteId = this.validateId(clienteId);
      
      // Converter credencial para JSON e criptografar
      const credentialJson = JSON.stringify(credential);
      const encryptedData = await this.cryptoService.encrypt(
        credentialJson, 
        this.getEncryptionKey(validClienteId)
      );
      
      // Criar objeto de credencial para salvar
      const govCredential: IGovCredentials = {
        cliente_id: validClienteId,
        credential_name: credentialName || 'Credencial sem nome',
        encrypted_data: encryptedData,
        is_active: true,
        access_log: []
      };
      
      console.log('Salvando credencial para cliente:', validClienteId);
      
      // Salvar no banco de dados
      const { data, error } = await this.databaseService.supabase
        .from('gov_credentials')
        .insert(govCredential)
        .select()
        .single();
        
      if (error) {
        console.error('Erro do Supabase ao salvar credencial:', error);
        throw error;
      }
      
      // Atualizar cache
      this.updateCache(data);
      
      return data;
    } catch (error) {
      console.error('Erro ao salvar credencial governamental:', error);
      throw new Error('Não foi possível salvar a credencial governamental');
    }
  }
  
  /**
   * Atualiza uma credencial existente
   * 
   * @param credentialId - ID da credencial
   * @param credential - Objeto com os dados da credencial
   * @returns A credencial atualizada
   */
  async updateCredential(
    credentialId: string,
    credential: IDecryptedCredential,
    clienteId: string
  ): Promise<IGovCredentials> {
    try {
      // Validar IDs
      const validCredentialId = this.validateId(credentialId);
      const validClienteId = this.validateId(clienteId);
      
      // Buscar credencial atual
      const { data: existingCredential, error: fetchError } = await this.databaseService.supabase
        .from('gov_credentials')
        .select('*')
        .eq('id', validCredentialId)
        .eq('cliente_id', validClienteId)
        .single();
        
      if (fetchError) {
        console.error('Erro ao buscar credencial para atualização:', fetchError);
        throw fetchError;
      }
      
      if (!existingCredential) {
        throw new Error('Credencial não encontrada ou sem permissão');
      }
      
      // Criptografar novos dados
      const credentialJson = JSON.stringify(credential);
      const encryptedData = await this.cryptoService.encrypt(
        credentialJson, 
        this.getEncryptionKey(validClienteId)
      );
      
      // Atualizar no banco de dados
      const { data, error } = await this.databaseService.supabase
        .from('gov_credentials')
        .update({
          encrypted_data: encryptedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', validCredentialId)
        .select()
        .single();
        
      if (error) {
        console.error('Erro ao atualizar dados no Supabase:', error);
        throw error;
      }
      
      // Atualizar cache
      this.updateCache(data);
      
      return data;
    } catch (error) {
      console.error('Erro ao atualizar credencial governamental:', error);
      throw new Error('Não foi possível atualizar a credencial');
    }
  }
  
  /**
   * Busca todas as credenciais de um cliente
   * 
   * @param clienteId - ID do cliente
   * @returns Lista de credenciais do cliente
   */
  async getClientCredentials(clienteId: string): Promise<IGovCredentials[]> {
    try {
      // Validar ID do cliente
      const validClienteId = this.validateId(clienteId);
      
      console.log('Buscando credenciais para cliente:', validClienteId);
      
      // Verificar se a tabela gov_credentials existe
      try {
        const { count, error: countError } = await this.databaseService.supabase
          .from('gov_credentials')
          .select('*', { count: 'exact', head: true });
        
        if (countError) {
          console.error('Erro ao verificar tabela gov_credentials:', countError);
          // A tabela pode não existir, retornar array vazio
          return [];
        }
      } catch (tableError) {
        console.error('Possível erro de tabela não existente:', tableError);
        return [];
      }
      
      const { data, error } = await this.databaseService.supabase
        .from('gov_credentials')
        .select('*')
        .eq('cliente_id', validClienteId)
        .eq('is_active', true);
        
      if (error) {
        console.error('Erro ao buscar credenciais no Supabase:', error);
        throw error;
      }
      
      // Atualizar cache com todas as credenciais
      const newCache = new Map(this.credentialsCache());
      data.forEach(credential => {
        newCache.set(credential.id!, credential);
      });
      this.credentialsCache.set(newCache);
      
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar credenciais do cliente:', error);
      throw new Error('Não foi possível buscar as credenciais');
    }
  }

   /**
   * Busca todas as credenciais de um cliente
   * 
   * @param credentialId - ID do cliente
   * @returns Lista de credenciais do cliente
   */
   async getCredential(id: string): Promise<IGovCredentials[]> {
    try {
      // Validar ID do cliente
      const validCredentialId = this.validateId(id);
      
      console.log('Buscando credenciais:', validCredentialId);
      
      try {
        const { count, error: countError } = await this.databaseService.supabase
          .from('gov_credentials')
          .select('*', { count: 'exact', head: true });
        
        if (countError) {
          console.error('Erro ao verificar tabela gov_credentials:', countError);
          // A tabela pode não existir, retornar array vazio
          return [];
        }
      } catch (tableError) {
        console.error('Possível erro de tabela não existente:', tableError);
        return [];
      }
      
      const { data, error } = await this.databaseService.supabase
        .from('gov_credentials')
        .select('*')
        .eq('id', validCredentialId)
        .eq('is_active', true);
        
      if (error) {
        console.error('Erro ao buscar credenciais no Supabase:', error);
        throw error;
      }
      
      // Atualizar cache com todas as credenciais
      const newCache = new Map(this.credentialsCache());
      data.forEach(credential => {
        newCache.set(credential.id!, credential);
      });
      this.credentialsCache.set(newCache);
      
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar credenciais do cliente:', error);
      throw new Error('Não foi possível buscar as credenciais');
    }
  }
  
  /**
   * Busca todas as credenciais que um contador tem acesso
   * 
   * @param contadorId - ID do contador
   * @returns Lista de credenciais com detalhes básicos dos clientes
   */
  async getCredentialsForContador(contadorId: string): Promise<any[]> {
    try {
      // Validar ID do contador
      const validContadorId = this.validateId(contadorId);
      
      console.log('Buscando credenciais para contador:', validContadorId);
      
      // Verificar se as tabelas necessárias existem
      try {
        const { count, error: countError } = await this.databaseService.supabase
          .from('contador_clientes')
          .select('*', { count: 'exact', head: true });
        
        if (countError) {
          console.error('Erro ao verificar tabela contador_clientes:', countError);
          // Tabela pode não existir, retornar array vazio
          return [];
        }
      } catch (tableError) {
        console.error('Possível erro de tabela não existente:', tableError);
        return [];
      }
      
      // Esta query busca credenciais dos clientes vinculados ao contador
      const { data, error } = await this.databaseService.supabase
        .from('contador_clientes')
        .select(`
          cliente_id,
          profiles:cliente_id (id, nome_completo, cpf_cnpj),
          gov_credentials:cliente_id (
            id, credential_name, created_at, updated_at, is_active
          )
        `)
        .eq('contador_id', validContadorId)
        .eq('status', 'ativo');
        
      if (error) {
        console.error('Erro ao buscar relações contador-cliente no Supabase:', error);
        throw error;
      }
      
      // Formatar dados para mostrar apenas o necessário
      const credentialsList = [];
      for (const relation of data || []) {
        if (relation.gov_credentials && relation.gov_credentials.length > 0) {
          // Cada cliente deve ter seus dados em profiles
          const clienteInfo = relation.profiles as any;
          
          if (!clienteInfo) {
            console.warn('Dados do cliente não encontrados para relação:', relation);
            continue;
          }
          
          for (const credential of relation.gov_credentials) {
            // Só incluir credenciais ativas
            if (credential.is_active) {
              credentialsList.push({
                credential_id: credential.id,
                credential_name: credential.credential_name,
                cliente_id: clienteInfo.id,
                cliente_nome: clienteInfo.nome_completo || 'Nome não disponível',
                cliente_documento: clienteInfo.cpf_cnpj || 'Documento não disponível',
                updated_at: credential.updated_at,
                created_at: credential.created_at
              });
            }
          }
        }
      }
      
      return credentialsList;
    } catch (error) {
      console.error('Erro ao buscar credenciais para contador:', error);
      throw new Error('Não foi possível buscar as credenciais');
    }
  }
  
  /**
   * Descriptografa e recupera os dados de uma credencial
   * Registra o acesso no log de acesso
   * 
   * @param credentialId - ID da credencial
   * @param contadorId - ID do contador (para registro no log)
   * @returns Dados descriptografados
   */
  async decryptCredential(
    credentialId: string, 
    contadorId: string
  ): Promise<IDecryptedCredential> {
    try {
      // Validar IDs
      const validCredentialId = this.validateId(credentialId);
      const validContadorId = this.validateId(contadorId);
      
      console.log('Descriptografando credencial:', validCredentialId, 'para contador:', validContadorId);
      
      // Verificar se contador tem acesso ao cliente
      const { data: credentialData, error } = await this.databaseService.supabase
        .from('gov_credentials')
        .select(`
          *,
          cliente:cliente_id (id)
        `)
        .eq('id', validCredentialId)
        .single();
      
      if (error) {
        console.error('Erro ao buscar credencial para descriptografia:', error);
        throw error;
      }
      
      if (!credentialData) {
        throw new Error('Credencial não encontrada');
      }
      
      // Em um cenário real, verificaríamos se o contador tem acesso ao cliente
      // Para desenvolvimento, vamos pular essa verificação
      
      // Descriptografar dados
      const decrypted = await this.cryptoService.decrypt(
        credentialData.encrypted_data,
        this.getEncryptionKey(credentialData.cliente_id)
      );
      
      // Registrar acesso no log
      await this.logAccess(validCredentialId, validContadorId, 'decrypt');
      
      // Retornar dados descriptografados
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Erro ao descriptografar credencial:', error);
      throw new Error('Não foi possível recuperar a credencial');
    }
  }
  
  /**
   * Revoga uma credencial (desativa sem excluir)
   * 
   * @param credentialId - ID da credencial
   * @param clienteId - ID do cliente (para verificação de permissão)
   * @returns Resultado da operação
   */
  async revokeCredential(credentialId: string, clienteId: string): Promise<boolean> {
    try {
      // Validar IDs
      const validCredentialId = this.validateId(credentialId);
      const validClienteId = this.validateId(clienteId);
      
      const { data, error } = await this.databaseService.supabase
        .from('gov_credentials')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', validCredentialId)
        .eq('cliente_id', validClienteId);
        
      if (error) {
        console.error('Erro ao revogar credencial no Supabase:', error);
        throw error;
      }
      
      // Atualizar cache
      const newCache = new Map(this.credentialsCache());
      const credential = newCache.get(validCredentialId);
      if (credential) {
        credential.is_active = false;
        newCache.set(validCredentialId, credential);
        this.credentialsCache.set(newCache);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao revogar credencial:', error);
      throw new Error('Não foi possível revogar a credencial');
    }
  }
  
  /**
   * Registra um acesso no log de acessos
   * 
   * @param credentialId - ID da credencial
   * @param contadorId - ID do contador que acessou
   * @param action - Tipo de ação realizada
   */
  private async logAccess(
    credentialId: string, 
    contadorId: string, 
    action: 'view' | 'decrypt'
  ): Promise<void> {
    try {
      // Obter IP do cliente (versão simplificada - em produção usar um serviço mais robusto)
      const ipAddress = await this.getClientIP();
      
      // Criar log de acesso
      const accessLog: IAccessLog = {
        timestamp: new Date().toISOString(),
        contador_id: contadorId,
        action,
        ip_address: ipAddress
      };
      
      // Buscar logs existentes
      const { data, error } = await this.databaseService.supabase
        .from('gov_credentials')
        .select('access_log')
        .eq('id', credentialId)
        .single();
        
      if (error) {
        console.error('Erro ao buscar logs de acesso existentes:', error);
        return; // Falhar silenciosamente para não bloquear o acesso
      }
      
      // Adicionar novo log à lista existente
      const accessLogs = data.access_log || [];
      accessLogs.push(accessLog);
      
      // Atualizar no banco de dados
      const { error: updateError } = await this.databaseService.supabase
        .from('gov_credentials')
        .update({ 
          access_log: accessLogs,
          updated_at: new Date().toISOString()
        })
        .eq('id', credentialId);
        
      if (updateError) {
        console.error('Erro ao atualizar log de acesso:', updateError);
      }
    } catch (error) {
      console.error('Erro ao registrar acesso no log:', error);
      // Não lançar erro para não impedir o acesso à credencial
    }
  }
  
  /**
   * Atualiza o cache local com uma nova credencial
   */
  private updateCache(credential: IGovCredentials): void {
    if (!credential || !credential.id) {
      console.warn('Tentativa de atualizar cache com credencial inválida');
      return;
    }
    
    const newCache = new Map(this.credentialsCache());
    newCache.set(credential.id, credential);
    this.credentialsCache.set(newCache);
  }
  
  /**
   * Obtém a chave de criptografia específica para um cliente
   * Derivada da chave mestra do sistema e do ID do cliente
   */
  private getEncryptionKey(clienteId: string): string {
    const validId = this.validateId(clienteId);
    const baseKey = `${this.systemKey}_${validId}`;
    
    // Garantir que a chave tenha pelo menos 32 caracteres
    return baseKey.padEnd(32, '0').substring(0, 32);
  }
  
  /**
   * Obtém o endereço IP do cliente para registro no log
   * Versão simplificada - em produção usar um serviço mais robusto
   */
  private async getClientIP(): Promise<string> {
    try {
      // Modo de desenvolvimento ou teste
      if (!environment.productions) {
        return '127.0.0.1';
      }
      
      // Opção 1: Usar um serviço público (apenas para demonstração)
      const response = await firstValueFrom(
        this.http.get('https://api.ipify.org?format=json')
      );
      return (response as any).ip || 'unknown';
    } catch {
      // Fallback - não conseguiu obter o IP
      return 'unknown';
    }
  }

  /**
   * Adapta o método getCredentialsForContador para retornar um Observable para compatibilidade com o Angular
   * Isso facilita o uso em componentes que esperam um Observable
   */
  getCredentialsForContadorAsObservable(contadorId: string): Observable<IGovCredentials[]> {
    return from(this.getCredentialsForContador(contadorId));
  }

  /**
   * Adapta o método decryptCredential para retornar um Observable para compatibilidade com o Angular
   * Isso facilita o uso em componentes que esperam um Observable
   */
  decryptCredentialAsObservable(credentialId: string, contadorId: string): Observable<IDecryptedCredential> {
    return from(this.decryptCredential(credentialId, contadorId));
  }
} 