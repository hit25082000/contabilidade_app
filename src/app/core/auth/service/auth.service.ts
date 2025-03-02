import { Injectable, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, from, map, tap, catchError, throwError, switchMap } from 'rxjs';
import { IUser, ISession } from '../models/user.interface';
import { AuthStore } from './auth.store';
import { AuthSupabaseService } from '../providers/auth.provider';
import { DatabaseService } from '../../services/database.service';
/**
 * Serviço de autenticação que integra o provedor de autenticação com o store
 * Utiliza signals e effects do Angular 19 para gerenciamento de estado
 * @class AuthService
 */
@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private authProvider = inject(AuthSupabaseService);
    private database = inject(DatabaseService);
    private authStore = inject(AuthStore);
    private router = inject(Router);

    constructor() {
        // Configura o listener de mudanças no estado de autenticação
        this.authProvider.onAuthStateChanged((session) => {
            if (session) {
                this.handleSession(session);
            } else {
                this.authStore.clearSession();
            }
        });

        // Efeito para monitorar erros do provedor de autenticação
        effect(() => {
            const error = this.authProvider.error();
            if (error) {
                this.authStore.setError(error);
            }
        });

        // Efeito para monitorar estado de loading do provedor de autenticação
        effect(() => {
            const isLoading = this.authProvider.isLoading();
            this.authStore.setLoading(isLoading);
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
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            this.authStore.setError(`Erro ao verificar usuário atual: ${errorMessage}`);
        }
    }

    /**
     * Realiza login com email e senha
     * @param email - Email do usuário
     * @param password - Senha do usuário
     */
    login(email: string, password: string): Observable<IUser> {
        this.authStore.setLoading(true);
        this.authStore.setError(null);
        
        return from(this.authProvider.signInWithEmailAndPassword(email, password)).pipe(
            switchMap(response => {
                if (response.error) {
                    throw new Error(response.error.message);
                }
                
                return this.getUserProfile(response.user.id);
            }),
            tap(user => {
                this.authStore.updateUser(user);
                this.authStore.setLoading(false);
            }),
            catchError(error => {
                this.authStore.setError(error.message);
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
        return from(this.authProvider.signUp(email, password, userData)).pipe(
            map(data => {
                return this.handleSession(data.session);
            }),
            tap(() => {
                this.router.navigate(['/dashboard']);
            }),
            catchError(error => {
                const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
                this.authStore.setError(`Erro ao realizar registro: ${errorMessage}`);
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
                const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
                this.authStore.setError(`Erro ao realizar logout: ${errorMessage}`);
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
                const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
                this.authStore.setError(`Erro ao solicitar recuperação de senha: ${errorMessage}`);
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
                const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
                this.authStore.setError(`Erro ao atualizar senha: ${errorMessage}`);
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

    // Método para buscar o perfil completo do usuário
    private getUserProfile(userId: string): Observable<IUser> {
        return from(this.database.getUserProfile(userId)).pipe(
        ).pipe(
            map(response => {
                if (response.error) {
                    throw new Error(response.error.message);
                }
                return response.data as IUser;
            })
        );
    }
} 