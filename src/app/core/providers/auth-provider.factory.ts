import { InjectionToken } from '@angular/core';
import { IAuthProvider } from '../interfaces/auth-provider.interface';
import { SupabaseAuthProvider } from './supabase-auth.provider';
import { FirebaseAuthProvider } from './firebase-auth.provider';
import { environment } from '../../../environments/environment';

/**
 * Token de injeção para o provedor de autenticação
 */
export const AUTH_PROVIDER = new InjectionToken<IAuthProvider>('AUTH_PROVIDER');

/**
 * Fábrica que retorna o provedor de autenticação correto com base na configuração
 * @returns Provedor de autenticação
 */
export function authProviderFactory() {
    // Aqui você pode definir a lógica para escolher o provedor
    // Por exemplo, baseado em uma variável de ambiente
    const authProvider = environment.AUTH_PROVIDER || 'supabase';
    
    switch (authProvider) {
        case 'firebase':
            return new FirebaseAuthProvider();
        case 'supabase':
        default:
            return new SupabaseAuthProvider();
    }
} 