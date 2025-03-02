import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { IAuthProvider } from '../interfaces/auth-provider.interface';

/**
 * Serviço de autenticação usando Supabase
 * Implementa a interface IAuthProvider para permitir fácil substituição
 * por outros provedores de autenticação se necessário
 * @class SupabaseAuthService
 */
@Injectable({
    providedIn: 'root'
})
export class AuthSupabaseService  {
    private supabase!: SupabaseClient;
    private authStateCallback: ((user: any) => void) | null = null;
    
    // Signals para gerenciamento de estado (Angular 19)
    private currentUserSignal = signal<User | null>(null);
    private sessionSignal = signal<Session | null>(null);
    private isLoadingSignal = signal<boolean>(false);
    private errorSignal = signal<string | null>(null);

    constructor() {
        this.initialize();
    }

    /**
     * Inicializa o cliente Supabase e configura listeners de autenticação
     */
    initialize(): void {
        try {
            if (!environment.SUPABASE_URL || !environment.SUPABASE_ANON_KEY) {
                this.errorSignal.set('Configuração do Supabase incompleta. Verifique as variáveis de ambiente.');
                return;
            }
            
            this.supabase = createClient(
                environment.SUPABASE_URL,
                environment.SUPABASE_ANON_KEY,
                {
                    auth: {
                        autoRefreshToken: false,
                        persistSession: false
                    }
                }
            );
            
            // Configura listener para mudanças de autenticação
            this.supabase.auth.onAuthStateChange((event, session) => {
                this.sessionSignal.set(session);
                
                if (session?.user) {
                    this.currentUserSignal.set(session.user);
                } else {
                    this.currentUserSignal.set(null);
                }
                
                if (this.authStateCallback) {
                    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                        this.authStateCallback(session);
                    } else if (event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
                        this.authStateCallback(null);
                    }
                }
            });
            
            // Verifica sessão atual ao inicializar
            this.checkCurrentSession();
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            this.errorSignal.set(`Erro ao inicializar cliente Supabase: ${errorMessage}`);
        }
    }

    /**
     * Verifica a sessão atual do usuário
     * @private
     */
    private async checkCurrentSession(): Promise<void> {
        try {
            this.isLoadingSignal.set(true);
            const { data, error } = await this.supabase.auth.getSession();
            
            if (error) {
                this.errorSignal.set(`Erro ao verificar sessão: ${error.message}`);
                return;
            }
            
            this.sessionSignal.set(data.session);
            this.currentUserSignal.set(data.session?.user || null);
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            this.errorSignal.set(`Erro ao verificar sessão: ${errorMessage}`);
        } finally {
            this.isLoadingSignal.set(false);
        }
    }

    /**
     * Realiza login com email e senha
     * @param email - Email do usuário
     * @param password - Senha do usuário
     * @returns Promise com dados da sessão
     */
    async signInWithEmailAndPassword(email: string, password: string): Promise<any> {
        try {
            this.isLoadingSignal.set(true);
            this.errorSignal.set(null);
            
            const { data, error } = await this.supabase.auth.signInWithPassword({ 
                email, 
                password 
            });
            
            if (error) {
                this.errorSignal.set(`Erro ao fazer login: ${error.message}`);
                throw error;
            }
            
            return data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            this.errorSignal.set(`Erro ao fazer login: ${errorMessage}`);
            throw error;
        } finally {
            this.isLoadingSignal.set(false);
        }
    }

    /**
     * Realiza o registro de um novo usuário
     * @param email - Email do usuário
     * @param password - Senha do usuário
     * @param userData - Dados adicionais do usuário
     * @returns Promise com dados do usuário criado
     */
    async signUp(email: string, password: string, userData: any): Promise<any> {
        try {
            this.isLoadingSignal.set(true);
            this.errorSignal.set(null);
            
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: userData
                }
            });
            
            if (error) {
                this.errorSignal.set(`Erro ao registrar usuário: ${error.message}`);
                throw error;
            }
            
            return data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            this.errorSignal.set(`Erro ao registrar usuário: ${errorMessage}`);
            throw error;
        } finally {
            this.isLoadingSignal.set(false);
        }
    }

    /**
     * Realiza o logout do usuário
     */
    async signOut(): Promise<void> {
        try {
            this.isLoadingSignal.set(true);
            this.errorSignal.set(null);
            
            const { error } = await this.supabase.auth.signOut();
            
            if (error) {
                this.errorSignal.set(`Erro ao fazer logout: ${error.message}`);
                throw error;
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            this.errorSignal.set(`Erro ao fazer logout: ${errorMessage}`);
            throw error;
        } finally {
            this.isLoadingSignal.set(false);
        }
    }

    /**
     * Recupera a senha do usuário
     * @param email - Email do usuário
     * @param redirectUrl - URL para redirecionamento após recuperação
     */
    async resetPassword(email: string, redirectUrl: string): Promise<void> {
        try {
            this.isLoadingSignal.set(true);
            this.errorSignal.set(null);
            
            const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
                redirectTo: redirectUrl
            });
            
            if (error) {
                this.errorSignal.set(`Erro ao recuperar senha: ${error.message}`);
                throw error;
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            this.errorSignal.set(`Erro ao recuperar senha: ${errorMessage}`);
            throw error;
        } finally {
            this.isLoadingSignal.set(false);
        }
    }

    /**
     * Atualiza a senha do usuário
     * @param newPassword - Nova senha
     */
    async updatePassword(newPassword: string): Promise<void> {
        try {
            this.isLoadingSignal.set(true);
            this.errorSignal.set(null);
            
            const { error } = await this.supabase.auth.updateUser({ 
                password: newPassword 
            });
            
            if (error) {
                this.errorSignal.set(`Erro ao atualizar senha: ${error.message}`);
                throw error;
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            this.errorSignal.set(`Erro ao atualizar senha: ${errorMessage}`);
            throw error;
        } finally {
            this.isLoadingSignal.set(false);
        }
    }

    /**
     * Configura um listener para mudanças no estado de autenticação
     * @param callback - Função a ser chamada quando o estado mudar
     */
    onAuthStateChanged(callback: (user: any) => void): void {
        this.authStateCallback = callback;
        
        // Verifica o estado inicial da sessão para o callback
        this.getCurrentUser().then(user => {
            if (callback) {
                callback(user);
            }
        });
    }

    /**
     * Obtém o usuário atual
     * @returns Promise com o usuário atual ou null
     */
    async getCurrentUser(): Promise<User | null> {
        try {
            const { data, error } = await this.supabase.auth.getUser();
            
            if (error) {
                if (error.message.includes('session')) {
                    return null;
                }
                this.errorSignal.set(`Erro ao obter usuário atual: ${error.message}`);
                throw error;
            }
            
            this.currentUserSignal.set(data.user);
            return data.user;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            this.errorSignal.set(`Erro ao obter usuário atual: ${errorMessage}`);
            return null;
        }
    }

    /**
     * Obtém o token de acesso atual
     * @returns Promise com o token de acesso ou null
     */
    async getAccessToken(): Promise<string | null> {
        try {
            const { data, error } = await this.supabase.auth.getSession();
            
            if (error) {
                this.errorSignal.set(`Erro ao obter token de acesso: ${error.message}`);
                return null;
            }
            
            return data.session?.access_token || null;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            this.errorSignal.set(`Erro ao obter token de acesso: ${errorMessage}`);
            return null;
        }
    }
    
    /**
     * Getters para os signals (para componentes que precisam observar mudanças)
     */
    get user() {
        return this.currentUserSignal;
    }
    
    get session() {
        return this.sessionSignal;
    }
    
    get isLoading() {
        return this.isLoadingSignal;
    }
    
    get error() {
        return this.errorSignal;
    }
} 