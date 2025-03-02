/**
 * Interface que define os métodos que qualquer provedor de autenticação deve implementar
 * Isso permite trocar facilmente entre diferentes provedores (Supabase, Firebase, etc.)
 * @interface IAuthProvider
 */
export interface IAuthProvider {
    /**
     * Inicializa o provedor de autenticação
     */
    initialize(): void;

    /**
     * Realiza login com email e senha
     * @param email - Email do usuário
     * @param password - Senha do usuário
     */
    signInWithEmailAndPassword(email: string, password: string): Promise<any>;

    /**
     * Realiza o registro de um novo usuário
     * @param email - Email do usuário
     * @param password - Senha do usuário
     * @param userData - Dados adicionais do usuário
     */
    signUp(email: string, password: string, userData: any): Promise<any>;

    /**
     * Realiza o logout do usuário
     */
    signOut(): Promise<void>;

    /**
     * Recupera a senha do usuário
     * @param email - Email do usuário
     * @param redirectUrl - URL para redirecionamento após recuperação
     */
    resetPassword(email: string, redirectUrl: string): Promise<void>;

    /**
     * Atualiza a senha do usuário
     * @param newPassword - Nova senha
     */
    updatePassword(newPassword: string): Promise<void>;

    /**
     * Configura um listener para mudanças no estado de autenticação
     * @param callback - Função a ser chamada quando o estado mudar
     */
    onAuthStateChanged(callback: (user: any) => void): void;

    /**
     * Obtém o usuário atual
     */
    getCurrentUser(): Promise<any>;

    /**
     * Obtém o token de acesso atual
     */
    getAccessToken(): Promise<string | null>;
} 