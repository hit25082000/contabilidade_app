import { Injectable, signal, inject } from '@angular/core';
import { createClient, SupabaseClient, User, Session, UserResponse } from '@supabase/supabase-js';
import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { environment } from '../../../../environments/environment';
import { IAuthProvider } from '../models/auth-provider.interface';
import { IUser } from '../models/user.interface';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { LocalStorageService } from '../../storage/services/local-storage.service';
import { CookieService } from 'ngx-cookie-service';

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
    private readonly platformId = inject(PLATFORM_ID);
    private readonly localStorage = inject(LocalStorageService);
    private readonly cookieService = inject(CookieService);
    
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
            
            // Verifica se estamos no navegador (browser) ou no servidor (SSR)
            const isBrowser = isPlatformBrowser(this.platformId);
            console.log('Ambiente de execução:', isBrowser ? 'Navegador' : 'Servidor (SSR)');
            
            if (isBrowser) {
                // Cliente para o navegador usando cookies
                this.supabase = createBrowserClient(
                    environment.SUPABASE_URL,
                    environment.SUPABASE_ANON_KEY,
                    {
                        auth: {
                            autoRefreshToken: true,
                            persistSession: true,
                            flowType: 'pkce',
                            detectSessionInUrl: true,
                            // Cookies são gerenciados automaticamente pelo createBrowserClient
                        }
                    }
                );
            } else {
                // Cliente para o servidor
                // Nota: Em um ambiente real de SSR, você precisaria acessar os cookies da requisição
                // Aqui estamos usando uma implementação simplificada
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
            }
            
            // Configura listener para mudanças de autenticação (apenas no navegador)
            if (isBrowser) {
                this.supabase.auth.onAuthStateChange((event, session) => {
                    console.log('Evento de autenticação:', event, session ? 'Sessão disponível' : 'Sem sessão');
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
                
                // Verifica sessão atual ao inicializar (apenas no navegador)
                this.checkCurrentSession();
            }
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            this.errorSignal.set(`Erro ao inicializar cliente Supabase: ${errorMessage}`);
            console.error('Erro ao inicializar cliente Supabase:', errorMessage);
        }
    }

    /**
     * Verifica a sessão atual do usuário
     * @private
     */
    private async checkCurrentSession(): Promise<void> {
        try {
            this.isLoadingSignal.set(true);
            
            // Verifica se estamos no navegador
            if (!isPlatformBrowser(this.platformId)) {
                console.log('checkCurrentSession: Ambiente de servidor, ignorando verificação de sessão');
                this.isLoadingSignal.set(false);
                return;
            }
            
            console.log('Verificando sessão atual...');
            const { data, error } = await this.supabase.auth.getSession();
            
            if (error) {
                this.errorSignal.set(`Erro ao verificar sessão: ${error.message}`);
                console.error('Erro ao verificar sessão:', error);
                return;
            }
            
            if (data.session) {
                this.sessionSignal.set(data.session);
                this.currentUserSignal.set(data.session.user);
                console.log('Sessão recuperada com sucesso');
            } else {
                console.log('Nenhuma sessão ativa encontrada');
                this.sessionSignal.set(null);
                this.currentUserSignal.set(null);
            }
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            this.errorSignal.set(`Erro ao verificar sessão: ${errorMessage}`);
            console.error('Erro ao verificar sessão:', errorMessage);
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
    async signInWithEmailAndPassword(email: string, password: string): Promise<UserResponse> {
        try {
            this.isLoadingSignal.set(true);
            this.errorSignal.set(null);
            
            console.log('Iniciando login com email e senha');
            
            const response = await this.supabase.auth.signInWithPassword({ 
                email, 
                password 
            });
            
            if (response.error) {
                this.errorSignal.set(`Erro ao fazer login: ${response.error.message}`);
                console.error('Erro ao fazer login:', response.error);
                throw response.error;
            }
            
            // Garante que a sessão seja armazenada corretamente
            if (response.data && response.data.session) {
                this.sessionSignal.set(response.data.session);
                this.currentUserSignal.set(response.data.user);
                console.log('Login realizado com sucesso');
            } else {
                console.warn('Aviso: Sessão não encontrada na resposta de login');
            }
            
            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            this.errorSignal.set(`Erro ao fazer login: ${errorMessage}`);
            console.error('Erro ao fazer login:', errorMessage);
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
            
            console.log('Iniciando registro de novo usuário');
            
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: userData
                }
            });
            
            if (error) {
                this.errorSignal.set(`Erro ao registrar usuário: ${error.message}`);
                console.error('Erro ao registrar usuário:', error);
                throw error;
            }
            
            console.log('Usuário registrado com sucesso');
            return data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            this.errorSignal.set(`Erro ao registrar usuário: ${errorMessage}`);
            console.error('Erro ao registrar usuário:', errorMessage);
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
            
            console.log('Iniciando logout');
            
            const { error } = await this.supabase.auth.signOut();
            
            if (error) {
                this.errorSignal.set(`Erro ao fazer logout: ${error.message}`);
                console.error('Erro ao fazer logout:', error);
                throw error;
            }
            
            console.log('Logout realizado com sucesso');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            this.errorSignal.set(`Erro ao fazer logout: ${errorMessage}`);
            console.error('Erro ao fazer logout:', errorMessage);
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
            
            console.log('Iniciando recuperação de senha');
            
            const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
                redirectTo: redirectUrl
            });
            
            if (error) {
                this.errorSignal.set(`Erro ao recuperar senha: ${error.message}`);
                console.error('Erro ao recuperar senha:', error);
                throw error;
            }
            
            console.log('Email de recuperação de senha enviado com sucesso');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            this.errorSignal.set(`Erro ao recuperar senha: ${errorMessage}`);
            console.error('Erro ao recuperar senha:', errorMessage);
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
            
            console.log('Iniciando atualização de senha');
            
            const { error } = await this.supabase.auth.updateUser({ 
                password: newPassword 
            });
            
            if (error) {
                this.errorSignal.set(`Erro ao atualizar senha: ${error.message}`);
                console.error('Erro ao atualizar senha:', error);
                throw error;
            }
            
            console.log('Senha atualizada com sucesso');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            this.errorSignal.set(`Erro ao atualizar senha: ${errorMessage}`);
            console.error('Erro ao atualizar senha:', errorMessage);
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
        
        // Verifica se estamos no navegador
        if (!isPlatformBrowser(this.platformId)) {
            console.log('onAuthStateChanged: Ambiente de servidor, ignorando configuração de listener');
            return;
        }
        
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
            // Verifica se estamos no navegador
            if (!isPlatformBrowser(this.platformId)) {
                console.log('getCurrentUser: Ambiente de servidor, ignorando obtenção de usuário');
                return null;
            }
            
            console.log('Obtendo usuário atual');
            const { data, error } = await this.supabase.auth.getUser();
            
            if (error) {
                if (error.message.includes('session')) {
                    console.log('Nenhuma sessão ativa encontrada');
                    return null;
                }
                this.errorSignal.set(`Erro ao obter usuário atual: ${error.message}`);
                console.error('Erro ao obter usuário atual:', error);
                throw error;
            }
            
            if (data.user) {
                console.log('Usuário atual obtido com sucesso');
                this.currentUserSignal.set(data.user);
            } else {
                console.log('Nenhum usuário autenticado encontrado');
                this.currentUserSignal.set(null);
            }
            
            return data.user;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            this.errorSignal.set(`Erro ao obter usuário atual: ${errorMessage}`);
            console.error('Erro ao obter usuário atual:', errorMessage);
            return null;
        }
    }

    /**
     * Obtém o token de acesso atual
     * @returns Promise com o token de acesso ou null
     */
    async getAccessToken(): Promise<string | null> {
        try {
            // Verifica se estamos no navegador
            if (!isPlatformBrowser(this.platformId)) {
                console.log('getAccessToken: Ambiente de servidor, ignorando obtenção de token');
                return null;
            }
            
            console.log('Obtendo token de acesso');
            const { data, error } = await this.supabase.auth.getSession();
            
            if (error) {
                this.errorSignal.set(`Erro ao obter token de acesso: ${error.message}`);
                console.error('Erro ao obter token de acesso:', error);
                return null;
            }
            
            if (data.session?.access_token) {
                console.log('Token de acesso obtido com sucesso');
                return data.session.access_token;
            } else {
                console.log('Nenhum token de acesso encontrado');
                return null;
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            this.errorSignal.set(`Erro ao obter token de acesso: ${errorMessage}`);
            console.error('Erro ao obter token de acesso:', errorMessage);
            return null;
        }
    }

    /**
     * Obtém a sessão atual
     * @returns Promise com a sessão atual
     */
    async getSession(): Promise<any> {
        try {
            // Verifica se estamos no navegador
            if (!isPlatformBrowser(this.platformId)) {
                console.log('getSession: Ambiente de servidor, ignorando obtenção de sessão');
                return { data: null, error: null };
            }
            
            console.log('Obtendo sessão atual');
            const sessionResponse = await this.supabase.auth.getSession();
            
            if (sessionResponse.error) {
                console.error('Erro ao obter sessão:', sessionResponse.error);
                this.errorSignal.set(`Erro ao obter sessão: ${sessionResponse.error.message}`);
                return { data: null, error: sessionResponse.error };
            }
            
            if (sessionResponse.data && sessionResponse.data.session) {
                console.log('Sessão obtida com sucesso');
            } else {
                console.log('Nenhuma sessão ativa encontrada');
            }
            
            return sessionResponse;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            console.error('Erro ao obter sessão:', errorMessage);
            this.errorSignal.set(`Erro ao obter sessão: ${errorMessage}`);
            return { data: null, error: { message: errorMessage } };
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