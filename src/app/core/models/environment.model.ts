/**
 * Interface para o ambiente da aplicação
 * Define todas as variáveis de ambiente disponíveis
 */
export interface IEnvironment {
  productions: boolean;
  SUPABASE_URL: string;
  SUPABASE_URL_HOM: string;
  PUSH_NOTIFICATIONS_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_FUNCTIONS_URL: string;
  SUPABASE_ADMIN_KEY: string;
  SUPABASE_FUNCTIONS_TOKEN: string;
  PUBLIC_VAPID_KEY: string;
  ENCRYPTION_KEY: string;
} 