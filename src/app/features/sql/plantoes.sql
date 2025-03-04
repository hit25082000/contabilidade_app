-- Criação da tabela de plantões
CREATE TABLE IF NOT EXISTS plantoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    horario_inicio TIME NOT NULL,
    horario_fim TIME NOT NULL,
    hospital TEXT NOT NULL,
    setor TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criação de índices para melhorar a performance das consultas
CREATE INDEX IF NOT EXISTS idx_plantoes_user_id ON plantoes(user_id);
CREATE INDEX IF NOT EXISTS idx_plantoes_data ON plantoes(data);

-- Configuração de políticas de segurança (RLS - Row Level Security)
ALTER TABLE plantoes ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas seus próprios plantões
CREATE POLICY "Usuários podem ver seus próprios plantões" 
ON plantoes FOR SELECT 
USING (auth.uid() = user_id);

-- Política para permitir que usuários criem seus próprios plantões
CREATE POLICY "Usuários podem criar seus próprios plantões" 
ON plantoes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários atualizem seus próprios plantões
CREATE POLICY "Usuários podem atualizar seus próprios plantões" 
ON plantoes FOR UPDATE 
USING (auth.uid() = user_id);

-- Política para permitir que usuários excluam seus próprios plantões
CREATE POLICY "Usuários podem excluir seus próprios plantões" 
ON plantoes FOR DELETE 
USING (auth.uid() = user_id);

-- Função para atualizar o timestamp de updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar o timestamp de updated_at automaticamente
CREATE TRIGGER update_plantoes_updated_at
BEFORE UPDATE ON plantoes
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column(); 