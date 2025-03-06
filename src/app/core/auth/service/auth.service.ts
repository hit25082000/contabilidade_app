import { Injectable, inject, effect, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, from, map, tap, catchError, throwError, switchMap, of } from 'rxjs';
import { IUser, ISession } from '../models/user.interface';
import { AuthStore } from './auth.store';
import { AuthSupabaseService } from '../providers/auth.provider';
import { DatabaseService } from '../../services/database.service';
import { isPlatformBrowser } from '@angular/common';
import { LoadingService } from '../../services/loading.service';
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
    private readonly platformId = inject(PLATFORM_ID);
    private loadingService = inject(LoadingService);

    constructor() {
        // Configura o listener de mudanças no estado de autenticação (apenas no navegador)
        if (isPlatformBrowser(this.platformId)) {
            // Primeiro, verifica se há um usuário autenticado ao iniciar
            // Isso é feito antes de configurar o listener para evitar processamentos duplicados
            this.checkCurrentUser().then(() => {
                // Depois de verificar a sessão inicial, configura o listener para mudanças futuras
                this.authProvider.onAuthStateChanged((session) => {
                    console.log('Evento de autenticação recebido:', session ? 'Com sessão' : 'Sem sessão');
                    
                    if (session) {
                        // Evita processar a sessão novamente se já foi processada pelo checkCurrentUser
                        const currentSession = this.authStore.session();
                        if (!currentSession || currentSession.access_token !== session.access_token) {
                            console.log('Processando nova sessão do evento de autenticação');
                            this.handleSession(session);
                        } else {
                            console.log('Sessão já processada, ignorando');
                        }
                    } else {
                        // Apenas limpa a sessão se não houver uma armazenada localmente
                        const storedSession = this.authStore.getStoredSession();
                        if (!storedSession) {
                            console.log('Limpando sessão');
                            this.authStore.clearSession();
                        } else {
                            console.log('Mantendo sessão armazenada localmente');
                        }
                    }
                });
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
        } else {
            console.log('AuthService: Ambiente de servidor, ignorando inicialização de listeners');
        }
    }

    /**
     * Verifica se há um usuário autenticado ao iniciar
     * @returns Promise que resolve quando a verificação estiver concluída
     */
    private async checkCurrentUser(): Promise<void> {
        try {
            this.authStore.setLoading(true);
            this.loadingService.show();
            
            // Verifica se estamos no navegador
            if (!isPlatformBrowser(this.platformId)) {
                console.log('checkCurrentUser: Ambiente de servidor, ignorando verificação de usuário');
                this.authStore.setLoading(false);
                this.loadingService.hide();
                return;
            }
            
            console.log('Iniciando verificação de sessão atual');
            
            // Primeiro, verifica se já temos uma sessão válida no store
            const currentSession = this.authStore.session();
            if (currentSession && currentSession.access_token) {
                console.log('Sessão já existe no store, verificando validade');
                
                // Verifica se o token ainda é válido
                try {
                    const user = await this.authProvider.getCurrentUser();
                    if (user) {
                        console.log('Sessão atual é válida, mantendo');
                        this.loadingService.hide();
                        this.authStore.setLoading(false);
                        return;
                    }
                } catch (error) {
                    console.log('Erro ao verificar usuário atual, sessão pode estar expirada');
                }
            }
            
            // Tenta obter a sessão do Supabase
            console.log('Tentando obter sessão do Supabase');
            const sessionResponse = await this.authProvider.getSession();
            
            if (sessionResponse.data?.session) {
                console.log('Sessão encontrada no Supabase');
                this.handleSession(sessionResponse.data.session);
                this.loadingService.hide();
                this.authStore.setLoading(false);
                return;
            }
            
            // Se não encontrar sessão no Supabase, verifica no localStorage
            console.log('Nenhuma sessão ativa no Supabase, verificando armazenamento local');
            const storedSession = this.authStore.getStoredSession();
            if (storedSession) {
                console.log('Sessão encontrada no armazenamento local');
                
                // Verifica se a sessão armazenada ainda é válida
                try {
                    // Tenta obter o usuário atual para verificar se a sessão é válida
                    const user = await this.authProvider.getCurrentUser();
                    if (user) {
                        console.log('Sessão do armazenamento local é válida');
                        this.authStore.setSession(storedSession);
                    } else {
                        console.log('Sessão do armazenamento local é inválida, limpando');
                        this.authStore.clearSession();
                    }
                } catch (error) {
                    console.log('Erro ao verificar sessão do armazenamento local, limpando');
                    this.authStore.clearSession();
                }
                
                this.loadingService.hide();
                this.authStore.setLoading(false);
                return;
            }
            
            // Se não encontrar sessão em nenhum lugar, limpa o estado
            console.log('Nenhuma sessão encontrada, limpando estado');
            this.authStore.clearSession();
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            this.authStore.setError(`Erro ao verificar usuário atual: ${errorMessage}`);
            console.error('Erro ao verificar usuário atual:', errorMessage);
            this.authStore.clearSession();
        } finally {
            this.authStore.setLoading(false);
            this.loadingService.hide();
        }
    }

    /**
     * Realiza login com email e senha
     * @param email - Email do usuário
     * @param password - Senha do usuário
     */
    login(email: string, password: string): Observable<IUser> {
        // Verifica se estamos no navegador
        if (!isPlatformBrowser(this.platformId)) {
            console.log('login: Ambiente de servidor, ignorando login');
            return throwError(() => new Error('Login não disponível no ambiente de servidor'));
        }
        
        this.authStore.setLoading(true);
        this.authStore.setError(null);
        
        return from(this.authProvider.signInWithEmailAndPassword(email, password)).pipe(
            switchMap(response => {
                if (response.error) {
                    throw new Error(response.error.message);
                }
                
                // Processa a sessão se disponível
                if (response.data) {
                    // O tipo de retorno pode variar, então tratamos de forma segura
                    const responseData = response.data as any;
                    if (responseData.session) {
                        this.handleSession(responseData.session);
                        console.log('Sessão armazenada no login');
                    }
                    
                    return this.getUserProfile(response.data.user.id);
                } else {
                    throw new Error('Dados de resposta inválidos');
                }
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
        // Verifica se estamos no navegador
        if (!isPlatformBrowser(this.platformId)) {
            console.log('register: Ambiente de servidor, ignorando registro');
            return throwError(() => new Error('Registro não disponível no ambiente de servidor'));
        }
        
        this.authStore.setLoading(true);
        this.authStore.setError(null);
        
        return from(this.authProvider.signUp(email, password, userData)).pipe(
            map(data => {
                if (data.session) {
                    return this.handleSession(data.session);
                } else {
                    console.log('Registro realizado, mas sem sessão. Verificação de email pode ser necessária.');
                    return {
                        access_token: '',
                        refresh_token: '',
                        expires_in: 0,
                        user: data.user ? this.mapProviderUser(data.user) : {} as IUser
                    };
                }
            }),
            tap((session) => {
                // Redirecionar com base na role do usuário
                if (session.user?.role === 'contador') {
                    this.router.navigateByUrl('/contador');
                } else {
                    this.router.navigateByUrl('/cliente');
                }
                this.authStore.setLoading(false);
            }),
            catchError(error => {
                const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
                this.authStore.setError(`Erro ao realizar registro: ${errorMessage}`);
                this.authStore.setLoading(false);
                return throwError(() => error);
            })
        );
    }

    /**
     * Realiza o logout do usuário
     */
    logout(): Observable<void> {
        // Verifica se estamos no navegador
        if (!isPlatformBrowser(this.platformId)) {
            console.log('logout: Ambiente de servidor, ignorando logout');
            return throwError(() => new Error('Logout não disponível no ambiente de servidor'));
        }
        
        this.authStore.setLoading(true);
        this.authStore.setError(null);
        
        return from(this.authProvider.signOut()).pipe(
            tap(() => {
                this.authStore.clearSession();
                this.router.navigate(['/auth/login']);
                this.authStore.setLoading(false);
            }),
            catchError(error => {
                const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
                this.authStore.setError(`Erro ao realizar logout: ${errorMessage}`);
                this.authStore.setLoading(false);
                return throwError(() => error);
            })
        );
    }

    /**
     * Recupera a senha do usuário
     * @param email - Email do usuário
     */
    resetPassword(email: string): Observable<void> {
        // Verifica se estamos no navegador
        if (!isPlatformBrowser(this.platformId)) {
            console.log('resetPassword: Ambiente de servidor, ignorando recuperação de senha');
            return throwError(() => new Error('Recuperação de senha não disponível no ambiente de servidor'));
        }
        
        const redirectUrl = `${window.location.origin}/auth/nova-senha`;
        
        this.authStore.setLoading(true);
        this.authStore.setError(null);
        
        return from(this.authProvider.resetPassword(email, redirectUrl)).pipe(
            tap(() => {
                this.authStore.setLoading(false);
            }),
            catchError(error => {
                const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
                this.authStore.setError(`Erro ao solicitar recuperação de senha: ${errorMessage}`);
                this.authStore.setLoading(false);
                return throwError(() => error);
            })
        );
    }

    /**
     * Atualiza a senha do usuário
     * @param newPassword - Nova senha
     */
    updatePassword(newPassword: string): Observable<void> {
        // Verifica se estamos no navegador
        if (!isPlatformBrowser(this.platformId)) {
            console.log('updatePassword: Ambiente de servidor, ignorando atualização de senha');
            return throwError(() => new Error('Atualização de senha não disponível no ambiente de servidor'));
        }
        
        this.authStore.setLoading(true);
        this.authStore.setError(null);
        
        return from(this.authProvider.updatePassword(newPassword)).pipe(
            tap(() => {
                this.authStore.setLoading(false);
            }),
            catchError(error => {
                const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
                this.authStore.setError(`Erro ao atualizar senha: ${errorMessage}`);
                this.authStore.setLoading(false);
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

        // Verifica se já temos uma sessão idêntica no store
        const currentSession = this.authStore.session();
        if (currentSession && 
            currentSession.access_token === (session.access_token || session.accessToken) &&
            currentSession.user?.id === (session.user?.id || session.user?.uid)) {
            console.log('Sessão idêntica já existe no store, ignorando processamento');
            return currentSession;
        }

        console.log('Processando nova sessão');
        
        // Verifica se a sessão tem o formato esperado
        let user;
        if (session.user) {
            user = session.user;
        } else if (session.data && session.data.user) {
            user = session.data.user;
        } else if (session.role){
            user = session;
        } 
        else {
            console.error('Formato de sessão não reconhecido:', session);
            throw new Error('Formato de sessão não reconhecido');
        }
        
        // Cria a sessão no formato da aplicação
        const userSession: ISession = {
            access_token: session.access_token || session.accessToken || '',
            refresh_token: session.refresh_token || session.refreshToken || '',
            expires_in: session.expires_in || session.expiresIn || 3600,
            user: this.mapProviderUser(user)
        };

        console.log('Sessão processada e armazenada');
        this.authStore.setSession(userSession);
        return userSession;
    }

    /**
     * Mapeia o usuário do provedor para nossa interface
     * @param providerUser - Usuário do provedor
     */
    private mapProviderUser(providerUser: any): IUser {
        // Verifica se providerUser existe
        if (!providerUser) {
            console.error('Erro: providerUser é undefined ou null');
            return {
                id: 'unknown',
                email: '',
                role: 'cliente',
                nome_completo: '',
                cpf_cnpj: '',
                telefone: '',
                created_at: new Date().toISOString(),
                last_sign_in_at: '',
                metadata: {
                    crc: '',
                    empresa: '',
                    cargo: ''
                }
            };
        }
        
        // Adapta o formato do usuário do provedor para o formato da aplicação
        // Isso permite que diferentes provedores retornem formatos diferentes
        const userData = providerUser.user_metadata || providerUser.metadata || {};
        console.log('User metadata:', providerUser.user_metadata);
        
        return {
            id: providerUser.id || providerUser.uid || 'unknown',
            email: providerUser.email || '',
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