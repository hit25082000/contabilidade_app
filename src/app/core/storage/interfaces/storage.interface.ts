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
} 