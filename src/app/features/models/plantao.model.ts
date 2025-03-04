/**
 * Interface que define a estrutura de dados do plantão
 * @interface IPlantao
 */
export interface IPlantao {
    id?: string;
    user_id: string;
    data: string;
    horario_inicio: string;
    horario_fim: string;
    hospital: string;
    setor?: string;
    observacoes?: string;
    created_at?: string;
    updated_at?: string;
} 