import { Injectable } from '@angular/core';

/**
 * Serviço responsável pela criptografia e descriptografia de dados sensíveis
 * Utiliza algoritmos de criptografia modernos e seguros
 */
@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  /**
   * Criptografa dados usando AES-GCM com uma chave derivada de PBKDF2
   * 
   * @param data - Os dados a serem criptografados
   * @param masterKey - A chave mestra (pode ser derivada da senha do usuário ou uma chave do sistema)
   * @returns O texto criptografado em formato Base64 com IV e salt
   */
  async encrypt(data: string, masterKey: string): Promise<string> {
    try {
      // Gerar salt aleatório de 16 bytes
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      
      // Gerar IV aleatório de 12 bytes
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      
      // Importar a chave mestra
      const keyMaterial = await this.getKeyMaterial(masterKey);
      
      // Derivar uma chave AES-GCM usando PBKDF2
      const key = await window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt']
      );
      
      // Converter a string de dados para ArrayBuffer
      const encodedData = new TextEncoder().encode(data);
      
      // Criptografar os dados
      const encryptedContent = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv
        },
        key,
        encodedData
      );
      
      // Concatenar salt, iv e dados criptografados
      const result = new Uint8Array(salt.length + iv.length + encryptedContent.byteLength);
      result.set(salt, 0);
      result.set(iv, salt.length);
      result.set(new Uint8Array(encryptedContent), salt.length + iv.length);
      
      // Converter para Base64
      return this.arrayBufferToBase64(result);
    } catch (error) {
      console.error('Erro durante a criptografia:', error);
      throw new Error('Falha ao criptografar os dados');
    }
  }
  
  /**
   * Descriptografa dados usando AES-GCM
   * 
   * @param encryptedData - Os dados criptografados em formato Base64
   * @param masterKey - A chave mestra (deve ser a mesma usada para criptografar)
   * @returns Os dados descriptografados
   */
  async decrypt(encryptedData: string, masterKey: string): Promise<string> {
    try {
      // Converter Base64 para ArrayBuffer
      const encryptedArray = this.base64ToArrayBuffer(encryptedData);
      
      // Extrair salt, iv e dados criptografados
      const salt = encryptedArray.slice(0, 16);
      const iv = encryptedArray.slice(16, 16 + 12);
      const encryptedContent = encryptedArray.slice(16 + 12);
      
      // Importar a chave mestra
      const keyMaterial = await this.getKeyMaterial(masterKey);
      
      // Derivar a mesma chave AES-GCM usando PBKDF2
      const key = await window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );
      
      // Descriptografar os dados
      const decryptedContent = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv
        },
        key,
        encryptedContent
      );
      
      // Converter ArrayBuffer para string
      return new TextDecoder().decode(decryptedContent);
    } catch (error) {
      console.error('Erro durante a descriptografia:', error);
      throw new Error('Falha ao descriptografar os dados. A chave pode estar incorreta.');
    }
  }
  
  /**
   * Gera material de chave a partir da senha do usuário
   */
  private async getKeyMaterial(password: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    return window.crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
  }
  
  /**
   * Converte ArrayBuffer para string Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  
  /**
   * Converte string Base64 para ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
  
  /**
   * Gera uma chave mestra forte para o sistema
   * Pode ser usada para gerar chaves únicas para cada aplicação
   */
  async generateMasterKey(): Promise<string> {
    const keyData = window.crypto.getRandomValues(new Uint8Array(32));
    return this.arrayBufferToBase64(keyData);
  }
} 