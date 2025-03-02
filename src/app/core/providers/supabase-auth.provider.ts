import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { IAuthProvider } from '../interfaces/auth-provider.interface';

/**
 * Implementação do provedor de autenticação usando Supabase
 * @class SupabaseAuthProvider
 * @implements {IAuthProvider}
 */
@Injectable({
    providedIn: 'root'
})
export class SupabaseAuthProvider implements IAuthProvider {
    private supabase!: SupabaseClient;
    private authStateCallback: ((user: any) => void) | null = null;

    constructor() {
        this.initialize();
    }

    /**
     * Inicializa o cliente Supabase
     */
    initialize(): void {
        try {
            if (!environment.SUPABASE_URL || !environment.SUPABASE_ANON_KEY) {
                console.error('Configuração do Supabase incompleta. Verifique as variáveis de ambiente.');
                return;
            }
            
            this.supabase = createClient(
                environment.SUPABASE_URL,
                environment.SUPABASE_ANON_KEY,
                {
                    auth: {
                        autoRefreshToken: true,
                        persistSession: true
                    }
                }
            );
            
            console.log('Cliente Supabase inicializado com sucesso');
        } catch (error) {
            console.error('Erro ao inicializar cliente Supabase:', error);
        }
    }

    /**
     * Realiza login com email e senha
     * @param email - Email do usuário
     * @param password - Senha do usuário
     */
    async signInWithEmailAndPassword(email: string, password: string): Promise<any> {
        const { data, error } = await this.supabase.auth.signInWithPassword({ 
            email, 
            password 
        });
        
        if (error) throw error;
        return data;
    }

    /**
     * Realiza o registro de um novo usuário
     * @param email - Email do usuário
     * @param password - Senha do usuário
     * @param userData - Dados adicionais do usuário
     */
    async signUp(email: string, password: string, userData: any): Promise<any> {
        const { data, error } = await this.supabase.auth.signUp({
            email,
            password,
            options: {
                data: userData
            }
        });
        
        if (error) throw error;
        return data;
    }

    /**
     * Realiza o logout do usuário
     */
    async signOut(): Promise<void> {
        const { error } = await this.supabase.auth.signOut();
        if (error) throw error;
    }

    /**
     * Recupera a senha do usuário
     * @param email - Email do usuário
     * @param redirectUrl - URL para redirecionamento após recuperação
     */
    async resetPassword(email: string, redirectUrl: string): Promise<void> {
        const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectUrl
        });
        
        if (error) throw error;
    }

    /**
     * Atualiza a senha do usuário
     * @param newPassword - Nova senha
     */
    async updatePassword(newPassword: string): Promise<void> {
        const { error } = await this.supabase.auth.updateUser({ 
            password: newPassword 
        });
        
        if (error) throw error;
    }

    /**
     * Configura um listener para mudanças no estado de autenticação
     * @param callback - Função a ser chamada quando o estado mudar
     */
    onAuthStateChanged(callback: (user: any) => void): void {
        this.authStateCallback = callback;
        
        this.supabase.auth.onAuthStateChange((event, session) => {
            if (this.authStateCallback) {
                console.log('Evento de autenticação:', event);
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    this.authStateCallback(session);
                } else if (event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
                    this.authStateCallback(null);
                }
            }
        });
        
        // Verifica o estado inicial da sessão
        this.supabase.auth.getSession().then(({ data }) => {
            if (data.session && this.authStateCallback) {
                this.authStateCallback(data.session);
            }
        }).catch(error => {
            console.log('Nenhuma sessão inicial encontrada:', error.message);
        });
    }

    /**
     * Obtém o usuário atual
     */
    async getCurrentUser(): Promise<any> {
        try {
            const { data, error } = await this.supabase.auth.getUser();
            if (error) {
                if (error.message.includes('session')) {
                    // Sessão não encontrada, retorna null em vez de lançar erro
                    return null;
                }
                throw error;
            }
            return data.user;
        } catch (error) {
            console.error('Erro ao obter usuário atual:', error);
            return null;
        }
    }

    /**
     * Obtém o token de acesso atual
     */
    async getAccessToken(): Promise<string | null> {
        try {
            const { data, error } = await this.supabase.auth.getSession();
            if (error) {
                console.log('Erro ao obter sessão:', error.message);
                return null;
            }
            return data.session?.access_token || null;
        } catch (error) {
            console.error('Erro ao obter token de acesso:', error);
            return null;
        }
    }
} 