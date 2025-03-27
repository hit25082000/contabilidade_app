/**
 * Interface para as credenciais governamentais
 * Utilizada para armazenar de forma segura as credenciais
 * que os clientes compartilham com seus contadores
 */
export interface IGovCredentials {
  id?: string;
  cliente_id: string;
  credential_name: string;
  encrypted_data: string;
  created_at?: string;
  updated_at?: string;
  access_log?: IAccessLog[];
  is_active: boolean;
}

/**
 * Interface para registrar os acessos às credenciais
 */
export interface IAccessLog {
  timestamp: string;
  contador_id: string;
  action: 'view' | 'decrypt';
  ip_address?: string;
}

/**
 * Interface para os dados descriptografados
 */
export interface IDecryptedCredential {
  email: string;
  password: string;
  portal: string;
  notes?: string;
  expiration_date?: string;
}

/**
 * Enum para os tipos de portais governamentais
 */
export enum GovPortalType {
  ECAC = 'Portal e-CAC',
  ESOCIAL = 'eSocial',
  GOVBR = 'Gov.BR',
  INSS = 'Portal INSS',
  PGDAS = 'PGDAS-D',
  OUTRO = 'Outro Portal'
} 