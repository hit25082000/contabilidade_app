import { Injectable, computed, signal } from '@angular/core';
import { ISession, IUser } from '../models/user.interface';

/**
 * Store responsável pelo gerenciamento de estado da autenticação
 * Utiliza Signals do Angular para gerenciamento de estado reativo
 * @class AuthStore
 */
@Injectable({
    providedIn: 'root'
})
export class AuthStore {
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

    /**
     * Atualiza o estado da sessão
     * @param session - Dados da sessão
     */
    setSession(session: ISession | null): void {
        this._session.set(session);
        this._error.set(null);
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
    }

    /**
     * Atualiza os dados do usuário
     * @param user - Dados do usuário
     */
    updateUser(user: IUser): void {
        if (this._session()) {
            this._session.update(session => session ? { ...session, user } : null);
        }
    }
} 