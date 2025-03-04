import { Injectable, inject } from '@angular/core';
import { IStorageService } from '../interfaces/storage.interface';
import { SupabaseStorageService } from '../providers/supabase-storage.service';

/**
 * Serviço abstrato para manipulação de storage
 * Os componentes devem usar este serviço ao invés de implementações específicas
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService implements IStorageService {
  // Injeta a implementação específica do Supabase
  // Para trocar o provider, basta mudar esta linha
  private storageProvider = inject(SupabaseStorageService);

  uploadFile(file: File, path: string): Promise<string> {
    return this.storageProvider.uploadFile(file, path);
  }

  deleteFile(path: string): Promise<void> {
    return this.storageProvider.deleteFile(path);
  }

  listFiles(path: string): Promise<any[]> {
    return this.storageProvider.listFiles(path);
  }

  getPublicUrl(path: string, download?: boolean): string {
    return this.storageProvider.getPublicUrl(path, download);
  }

  /**
   * Cria uma URL assinada para acesso temporário a um arquivo privado
   * @param path Caminho do arquivo
   * @param expiracaoEmSegundos Tempo de validade da URL em segundos
   * @returns Promise com a URL assinada ou null em caso de erro
   */
  createSignedUrl(path: string, expiracaoEmSegundos?: number): Promise<string | null> {
    return this.storageProvider.createSignedUrl(path, expiracaoEmSegundos);
  }
} 