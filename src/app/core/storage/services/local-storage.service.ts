import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Serviço para manipulação segura do localStorage
 * Lida com casos onde o localStorage não está disponível:
 * - Renderização do lado do servidor (SSR)
 * - Navegadores com cookies/armazenamento desativados
 * - Modo de navegação privada/anônima
 */
@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private readonly platformId = inject(PLATFORM_ID);
  private memoryStorage: Map<string, string> = new Map();
  private localStorageAvailable: boolean;

  constructor() {
    this.localStorageAvailable = this.checkLocalStorageAvailability();
    console.log(`LocalStorageService: localStorage ${this.localStorageAvailable ? 'disponível' : 'indisponível'}`);
  }

  /**
   * Verifica se o localStorage está disponível
   * @returns true se o localStorage estiver disponível, false caso contrário
   */
  private checkLocalStorageAvailability(): boolean {
    // Primeiro verifica se estamos no navegador
    if (!isPlatformBrowser(this.platformId)) {
      console.log('LocalStorageService: Ambiente de servidor, localStorage indisponível');
      return false;
    }

    // Verifica se o localStorage está disponível no navegador
    try {
      const testKey = '__test_storage__';
      localStorage.setItem(testKey, 'test');
      const testValue = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      return testValue === 'test';
    } catch (e) {
      console.warn('LocalStorageService: localStorage indisponível, usando armazenamento em memória', e);
      return false;
    }
  }

  /**
   * Obtém um item do armazenamento
   * @param key Chave do item
   * @returns Valor do item ou null se não existir
   */
  getItem(key: string): string | null {
    try {
      if (this.localStorageAvailable) {
        return localStorage.getItem(key);
      } else {
        return this.memoryStorage.get(key) || null;
      }
    } catch (error) {
      console.error(`LocalStorageService: Erro ao obter item '${key}'`, error);
      return this.memoryStorage.get(key) || null;
    }
  }

  /**
   * Armazena um item
   * @param key Chave do item
   * @param value Valor do item
   */
  setItem(key: string, value: string): void {
    try {
      // Sempre armazena em memória como backup
      this.memoryStorage.set(key, value);
      
      if (this.localStorageAvailable) {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`LocalStorageService: Erro ao armazenar item '${key}'`, error);
    }
  }

  /**
   * Remove um item do armazenamento
   * @param key Chave do item
   */
  removeItem(key: string): void {
    try {
      this.memoryStorage.delete(key);
      
      if (this.localStorageAvailable) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`LocalStorageService: Erro ao remover item '${key}'`, error);
    }
  }

  /**
   * Limpa todo o armazenamento
   */
  clear(): void {
    try {
      this.memoryStorage.clear();
      
      if (this.localStorageAvailable) {
        localStorage.clear();
      }
    } catch (error) {
      console.error('LocalStorageService: Erro ao limpar armazenamento', error);
    }
  }

  /**
   * Obtém um objeto JSON do armazenamento
   * @param key Chave do item
   * @returns Objeto JSON ou null se não existir ou for inválido
   */
  getObject<T>(key: string): T | null {
    try {
      const item = this.getItem(key);
      if (item) {
        return JSON.parse(item) as T;
      }
      return null;
    } catch (error) {
      console.error(`LocalStorageService: Erro ao obter objeto '${key}'`, error);
      return null;
    }
  }

  /**
   * Armazena um objeto JSON
   * @param key Chave do item
   * @param value Objeto a ser armazenado
   */
  setObject<T>(key: string, value: T): void {
    try {
      const jsonValue = JSON.stringify(value);
      this.setItem(key, jsonValue);
    } catch (error) {
      console.error(`LocalStorageService: Erro ao armazenar objeto '${key}'`, error);
    }
  }
} 