import { IEnvironment } from '../core/models/environment.model';

export const environment: IEnvironment = {
  productions: false,
  SUPABASE_URL: 'https://your-dev-supabase-url.supabase.co',
  SUPABASE_URL_HOM: 'https://your-dev-supabase-url.supabase.co',
  PUSH_NOTIFICATIONS_URL: 'https://your-dev-supabase-url.supabase.co',
  SUPABASE_ANON_KEY: 'your-dev-anon-key',
  SUPABASE_FUNCTIONS_URL: 'https://your-dev-supabase-url.supabase.co/functions/v1',
  SUPABASE_ADMIN_KEY: 'your-dev-admin-key',
  SUPABASE_FUNCTIONS_TOKEN: 'your-dev-functions-token',
  PUBLIC_VAPID_KEY: 'your-dev-vapid-key',
  ENCRYPTION_KEY: 'your-dev-encryption-key-at-least-32-chars'
}; 