/**
 * Interface que define os métodos para manipulação de storage
 * Permite a implementação com diferentes provedores (Supabase, Firebase, etc)
 */
export interface IStorageService {
  /**
   * Faz upload de um arquivo
   * @param file Arquivo a ser enviado
   * @param path Caminho onde o arquivo será salvo
   * @returns URL do arquivo enviado
   */
  uploadFile(file: File, path: string): Promise<string>;

  /**
   * Remove um arquivo do storage
   * @param path Caminho do arquivo
   */
  deleteFile(path: string): Promise<void>;

  /**
   * Lista arquivos em um diretório
   * @param path Caminho do diretório
   * @returns Lista de objetos FileObject
   */
  listFiles(path: string): Promise<any[]>;

  /**
   * Obtém a URL pública de um arquivo
   * @param path Caminho do arquivo
   * @param download Se true, adiciona parâmetro para download
   * @returns URL pública do arquivo
   */
  getPublicUrl(path: string, download?: boolean): string;

  /**
   * Cria uma URL assinada para acesso temporário a um arquivo privado
   * @param path Caminho do arquivo
   * @param expiracaoEmSegundos Tempo de validade da URL em segundos (padrão: 60)
   * @returns Promise com a URL assinada ou null em caso de erro
   */
  createSignedUrl(path: string, expiracaoEmSegundos?: number): Promise<string | null>;
} 