import { IEnvironment } from '../core/models/environment.model';

export const environment: IEnvironment = {
  productions: true,
  SUPABASE_URL: 'https://your-supabase-url.supabase.co',
  SUPABASE_URL_HOM: 'https://your-supabase-url.supabase.co',
  PUSH_NOTIFICATIONS_URL: 'https://your-supabase-url.supabase.co',
  SUPABASE_ANON_KEY: 'your-anon-key',
  SUPABASE_FUNCTIONS_URL: 'https://your-supabase-url.supabase.co/functions/v1',
  SUPABASE_ADMIN_KEY: 'your-admin-key',
  SUPABASE_FUNCTIONS_TOKEN: 'your-functions-token',
  PUBLIC_VAPID_KEY: 'your-vapid-key',
  ENCRYPTION_KEY: 'your-encryption-key-at-least-32-chars'
}; 