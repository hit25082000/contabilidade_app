/**
 * Interface que define a estrutura de dados do usuário
 * @interface IUser
 */
export interface IUser {
    id: string;
    email: string;
    role: 'contador' | 'cliente';
    nome_completo: string;
    cpf_cnpj: string;
    telefone?: string;
    created_at: string;
    last_sign_in_at?: string;
    metadata?: {
        crc?: string;  // Registro no Conselho Regional de Contabilidade (para contadores)
        empresa?: string;
        cargo?: string;
    };
}

/**
 * Interface que define a estrutura de dados da sessão do usuário
 * @interface ISession
 */
export interface ISession {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    user: IUser | null;
} 