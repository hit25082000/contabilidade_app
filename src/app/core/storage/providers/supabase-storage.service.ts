import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IStorageService } from '../interfaces/storage.interface';
import { environment } from '../../../../environments/environment';

export const supabase = createClient(
  environment.SUPABASE_URL,
  environment.SUPABASE_ADMIN_KEY,
  {
    auth: { persistSession: false, autoRefreshToken: false },
  }
);

/**
 * Implementação do serviço de storage usando Supabase
 * Gerencia operações de armazenamento de arquivos
 */
@Injectable({
  providedIn: 'root'
})
export class SupabaseStorageService implements IStorageService {
  private BUCKET_NAME = 'documentos';

  constructor() {
    this.inicializarBucket();
  }

  /**
   * Inicializa o bucket se ele não existir
   * Deve ser chamado antes de qualquer operação de storage
   */
  private async inicializarBucket(): Promise<void> {
    try {
      // Tenta listar os buckets para ver se o nosso existe
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) throw listError;

      // Verifica se nosso bucket já existe
      const bucketExists = buckets.some(bucket => bucket.name === this.BUCKET_NAME);

      if (!bucketExists) {
        // Cria o bucket se não existir
        const { error: createError } = await supabase.storage.createBucket(this.BUCKET_NAME, {
          public: true, // Permite acesso público aos arquivos
          fileSizeLimit: 52428800, // Limite de 50MB por arquivo
          allowedMimeTypes: ['application/pdf'] // Permite apenas PDFs
        });

        if (createError) throw createError;
        console.log(`Bucket ${this.BUCKET_NAME} criado com sucesso`);

        // Adiciona política de acesso público para leitura
        await this.configurarPoliticasAcesso();
      }
    } catch (error) {
      console.error('Erro ao inicializar bucket:', error);
    }
  }

  /**
   * Configura as políticas de acesso ao bucket
   * Permite leitura pública mas restringe escrita/deleção
   */
  private async configurarPoliticasAcesso(): Promise<void> {
    try {
      const { error } = await supabase.storage.from(this.BUCKET_NAME).createSignedUrl('dummy.txt', 1);
      if (error && error.message.includes('bucket policies')) {
        // Se não houver políticas, vamos criar via SQL
        const { error: policyError } = await supabase.rpc('create_storage_policy', {
          bucket_name: this.BUCKET_NAME
        });
        if (policyError) throw policyError;
      }
    } catch (error) {
      console.error('Erro ao configurar políticas:', error);
    }
  }

  async uploadFile(file: File, path: string): Promise<string> {
    try {
      const filePath = `${path}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Gera URL pública
      const { data } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      throw error;
    }
  }

  /**
   * Obtém a URL pública de um arquivo
   * @param path Caminho do arquivo
   * @param download Se true, adiciona parâmetro para download
   * @returns URL pública do arquivo
   */
  getPublicUrl(path: string, download: boolean = false): string {
    const { data } = supabase.storage.from(this.BUCKET_NAME).getPublicUrl(path, {
      download: download
    });
    return data.publicUrl;
  }

  /**
   * Cria uma URL assinada para acesso temporário a um arquivo privado
   * @param path Caminho do arquivo
   * @param expiracaoEmSegundos Tempo de validade da URL em segundos
   * @returns Promise com a URL assinada ou null em caso de erro
   */
  async createSignedUrl(path: string, expiracaoEmSegundos: number = 60): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(path, expiracaoEmSegundos);

      if (error) {
        console.error('Erro ao gerar URL assinada:', error);
        return null;
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Erro ao gerar URL assinada:', error);
      return null;
    }
  }

  async deleteFile(path: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([path]);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      throw error;
    }
  }

  async listFiles(path: string): Promise<any[]> {
    try {
      const { data: files, error: listError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(path);

      if (listError) throw listError;

      return files;
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
      throw error;
    }
  }
} 