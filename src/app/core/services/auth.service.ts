import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, from, map, tap, catchError, throwError } from 'rxjs';
import { IUser, ISession } from '../models/user.interface';
import { AuthStore } from '../store/auth.store';
import { AUTH_PROVIDER } from '../providers/auth-provider.factory';
import { IAuthProvider } from '../interfaces/auth-provider.interface';

/**
 * Serviço responsável pela autenticação
 * Usa um provedor abstrato que pode ser trocado facilmente (Supabase, Firebase, etc.)
 * @class AuthService
 */
@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private authProvider = inject(AUTH_PROVIDER);
    private authStore = inject(AuthStore);
    private router = inject(Router);

    constructor() {
        // Configura o listener de mudanças no estado de autenticação
        this.authProvider.onAuthStateChanged((session) => {
            if (session) {
                this.handleSession(session);
            } else {
                this.authStore.clearSession();
                this.router.navigate(['/auth/login']);
            }
        });

        // Verifica se há um usuário autenticado ao iniciar
        this.checkCurrentUser();
    }

    /**
     * Verifica se há um usuário autenticado ao iniciar
     */
    private async checkCurrentUser(): Promise<void> {
        try {
            const user = await this.authProvider.getCurrentUser();
            if (user) {
                const token = await this.authProvider.getAccessToken();
                // Simula uma sessão para o handleSession
                const session = {
                    user,
                    access_token: token,
                    refresh_token: '',
                    expires_in: 3600
                };
                this.handleSession(session);
            }
        } catch (error) {
            // Trata o erro de sessão ausente silenciosamente
            // Este erro é esperado quando não há usuário logado
            if (error instanceof Error && 
                (error.message.includes('Auth session missing') || 
                 error.message.includes('AuthSessionMissingError'))) {
                console.log('Nenhuma sessão ativa encontrada. Aguardando login...');
            } else {
                console.error('Erro ao verificar usuário atual:', error);
            }
        }
    }

    /**
     * Realiza login com email e senha
     * @param email - Email do usuário
     * @param password - Senha do usuário
     */
    login(email: string, password: string): Observable<ISession> {
        this.authStore.setLoading(true);
        
        return from(this.authProvider.signInWithEmailAndPassword(email, password))
            .pipe(
                map(data => {
                    return this.handleSession(data.session);
                }),
                tap(() => this.authStore.setLoading(false)),
                catchError(error => {
                    this.authStore.setError('Erro ao realizar login: ' + error.message);
                    this.authStore.setLoading(false);
                    return throwError(() => error);
                })
            );
    }

    /**
     * Realiza o registro de um novo usuário
     * @param email - Email do usuário
     * @param password - Senha do usuário
     * @param userData - Dados adicionais do usuário
     */
    register(email: string, password: string, userData: Partial<IUser>): Observable<ISession> {
        this.authStore.setLoading(true);

        return from(this.authProvider.signUp(email, password, userData)).pipe(
            map(data => {
                return this.handleSession(data.session);
            }),
            tap(() => this.authStore.setLoading(false)),
            catchError(error => {
                this.authStore.setError('Erro ao realizar registro: ' + error.message);
                this.authStore.setLoading(false);
                return throwError(() => error);
            })
        );
    }

    /**
     * Realiza o logout do usuário
     */
    logout(): Observable<void> {
        return from(this.authProvider.signOut()).pipe(
            tap(() => {
                this.authStore.clearSession();
                this.router.navigate(['/auth/login']);
            }),
            catchError(error => {
                this.authStore.setError('Erro ao realizar logout: ' + error.message);
                return throwError(() => error);
            })
        );
    }

    /**
     * Recupera a senha do usuário
     * @param email - Email do usuário
     */
    resetPassword(email: string): Observable<void> {
        const redirectUrl = `${window.location.origin}/auth/nova-senha`;
        
        return from(this.authProvider.resetPassword(email, redirectUrl)).pipe(
            catchError(error => {
                this.authStore.setError('Erro ao solicitar recuperação de senha: ' + error.message);
                return throwError(() => error);
            })
        );
    }

    /**
     * Atualiza a senha do usuário
     * @param newPassword - Nova senha
     */
    updatePassword(newPassword: string): Observable<void> {
        return from(this.authProvider.updatePassword(newPassword)).pipe(
            catchError(error => {
                this.authStore.setError('Erro ao atualizar senha: ' + error.message);
                return throwError(() => error);
            })
        );
    }

    /**
     * Processa e armazena os dados da sessão
     * @param session - Dados da sessão do provedor
     */
    private handleSession(session: any): ISession {
        if (!session) throw new Error('Sessão inválida');

        const userSession: ISession = {
            access_token: session.access_token,
            refresh_token: session.refresh_token || '',
            expires_in: session.expires_in || 3600,
            user: this.mapProviderUser(session.user)
        };

        this.authStore.setSession(userSession);
        return userSession;
    }

    /**
     * Mapeia o usuário do provedor para nossa interface
     * @param providerUser - Usuário do provedor
     */
    private mapProviderUser(providerUser: any): IUser {
        // Adapta o formato do usuário do provedor para o formato da aplicação
        // Isso permite que diferentes provedores retornem formatos diferentes
        const userData = providerUser.user_metadata || providerUser.metadata || {};
        
        return {
            id: providerUser.id || providerUser.uid,
            email: providerUser.email,
            role: userData.role || 'cliente',
            nome_completo: userData.nome_completo || providerUser.displayName || '',
            cpf_cnpj: userData.cpf_cnpj || '',
            telefone: userData.telefone || '',
            created_at: providerUser.created_at || providerUser.createdAt || new Date().toISOString(),
            last_sign_in_at: providerUser.last_sign_in_at || providerUser.lastLoginAt || '',
            metadata: {
                crc: userData.crc || '',
                empresa: userData.empresa || '',
                cargo: userData.cargo || ''
            }
        };
    }
} 