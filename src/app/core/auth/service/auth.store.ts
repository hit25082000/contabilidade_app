import { Injectable, computed, signal, inject } from '@angular/core';
import { ISession, IUser } from '../models/user.interface';
import { LocalStorageService } from '../../storage/services/local-storage.service';

/**
 * Store responsável pelo gerenciamento de estado da autenticação
 * Utiliza Signals do Angular para gerenciamento de estado reativo
 * @class AuthStore
 */
@Injectable({
    providedIn: 'root'
})
export class AuthStore {
    private readonly localStorage = inject(LocalStorageService);
    private readonly AUTH_SESSION_KEY = 'auth_session';
    
    // Estado privado
    private readonly _session = signal<ISession | null>(null);
    private readonly _loading = signal<boolean>(false);
    private readonly _error = signal<string | null>(null);

    // Seletores públicos computados
    readonly session = computed(() => this._session());
    readonly user = computed(() => this._session()?.user ?? null);
    readonly isAuthenticated = computed(() => !!this._session()?.access_token);
    readonly isLoading = computed(() => this._loading());
    readonly error = computed(() => this._error());
    readonly isContador = computed(() => this.user()?.role === 'contador');
    readonly isCliente = computed(() => this.user()?.role === 'cliente');

    constructor() {
        // Tenta recuperar a sessão do armazenamento local ao inicializar
        this.loadSessionFromStorage();
    }

    /**
     * Carrega a sessão do armazenamento local
     */
    private loadSessionFromStorage(): void {
        try {
            const storedSession = this.localStorage.getObject<ISession>(this.AUTH_SESSION_KEY);
            if (storedSession) {
                console.log('AuthStore: Sessão recuperada do armazenamento local');
                this._session.set(storedSession);
            }
        } catch (error) {
            console.error('AuthStore: Erro ao carregar sessão do armazenamento local', error);
        }
    }

    /**
     * Atualiza o estado da sessão
     * @param session - Dados da sessão
     */
    setSession(session: ISession | null): void {
        this._session.set(session);
        this._error.set(null);
        
        // Persiste a sessão no armazenamento local
        if (session) {
            this.localStorage.setObject(this.AUTH_SESSION_KEY, session);
            console.log('AuthStore: Sessão armazenada localmente');
        } else {
            this.localStorage.removeItem(this.AUTH_SESSION_KEY);
            console.log('AuthStore: Sessão removida do armazenamento local');
        }
    }

    /**
     * Recupera a sessão do armazenamento local
     * @returns A sessão armazenada ou null
     */
    getStoredSession(): ISession | null {
        return this.localStorage.getObject<ISession>(this.AUTH_SESSION_KEY);
    }

    /**
     * Atualiza o estado de loading
     * @param loading - Estado de loading
     */
    setLoading(loading: boolean): void {
        this._loading.set(loading);
    }

    /**
     * Atualiza o estado de erro
     * @param error - Mensagem de erro
     */
    setError(error: string | null): void {
        this._error.set(error);
    }

    /**
     * Limpa todos os dados da sessão
     */
    clearSession(): void {
        this._session.set(null);
        this._error.set(null);
        this.localStorage.removeItem(this.AUTH_SESSION_KEY);
        console.log('AuthStore: Sessão limpa');
    }

    /**
     * Atualiza os dados do usuário
     * @param user - Dados do usuário
     */
    updateUser(user: IUser): void {
        if (this._session()) {
            const updatedSession = {
                ...this._session()!,
                user
            };
            this.setSession(updatedSession);
            console.log('AuthStore: Dados do usuário atualizados');
        }
    }
} 