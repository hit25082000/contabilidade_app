-- Criação da tabela para armazenar credenciais governamentais criptografadas
CREATE TABLE IF NOT EXISTS gov_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES profiles(id),
  credential_name TEXT NOT NULL,
  encrypted_data TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  access_log JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE
);

-- Comentários para documentar a tabela e seus campos
COMMENT ON TABLE gov_credentials IS 'Armazena credenciais de acesso governamentais criptografadas compartilhadas por clientes com seus contadores';
COMMENT ON COLUMN gov_credentials.cliente_id IS 'ID do cliente que compartilhou as credenciais';
COMMENT ON COLUMN gov_credentials.credential_name IS 'Nome descritivo para a credencial (ex: "e-CAC - CPF XXX.XXX.XXX-XX")';
COMMENT ON COLUMN gov_credentials.encrypted_data IS 'Dados criptografados contendo email/senha e outras informações';
COMMENT ON COLUMN gov_credentials.access_log IS 'Registro de acessos às credenciais, contendo timestamp, contador_id e tipo de ação';
COMMENT ON COLUMN gov_credentials.is_active IS 'Indica se a credencial está ativa ou foi revogada';

-- Índices para melhorar performance de consultas
CREATE INDEX gov_credentials_cliente_id_idx ON gov_credentials(cliente_id);
CREATE INDEX gov_credentials_is_active_idx ON gov_credentials(is_active);

-- Políticas de segurança RLS (Row Level Security)

-- Habilitar RLS na tabela
ALTER TABLE gov_credentials ENABLE ROW LEVEL SECURITY;

-- Política para clientes verem apenas suas próprias credenciais
CREATE POLICY "Clientes podem ver apenas suas próprias credenciais" 
  ON gov_credentials 
  FOR SELECT 
  USING (auth.uid() = cliente_id);

-- Política para clientes inserirem apenas suas próprias credenciais
CREATE POLICY "Clientes podem inserir apenas suas próprias credenciais" 
  ON gov_credentials 
  FOR INSERT 
  WITH CHECK (auth.uid() = cliente_id);

-- Política para clientes atualizarem apenas suas próprias credenciais
CREATE POLICY "Clientes podem atualizar apenas suas próprias credenciais" 
  ON gov_credentials 
  FOR UPDATE 
  USING (auth.uid() = cliente_id);

-- Política para contadores verem credenciais dos clientes vinculados a eles
CREATE POLICY "Contadores podem ver credenciais de seus clientes"
  ON gov_credentials
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM contador_clientes
      WHERE contador_clientes.contador_id = auth.uid()
      AND contador_clientes.cliente_id = gov_credentials.cliente_id
      AND contador_clientes.status = 'ativo'
    )
  );

-- Função para criar trigger de atualização do campo updated_at
CREATE OR REPLACE FUNCTION update_gov_credentials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar campo updated_at automaticamente
CREATE TRIGGER update_gov_credentials_updated_at_trigger
BEFORE UPDATE ON gov_credentials
FOR EACH ROW
EXECUTE FUNCTION update_gov_credentials_updated_at();