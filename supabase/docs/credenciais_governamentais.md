# Módulo de Credenciais Governamentais - Guia de Solução de Problemas

Este guia contém instruções para resolver problemas comuns relacionados ao módulo de compartilhamento de credenciais governamentais.

## Configuração Inicial

O módulo depende da criação da tabela `gov_credentials` no banco de dados Supabase. Caso esteja tendo problemas com a tabela, siga estas instruções:

### Criação da Tabela

1. Acesse o painel do Supabase para seu projeto
2. Navegue até o "SQL Editor"
3. Execute o script localizado em `supabase/scripts/create_gov_credentials_table.sql`
4. Verifique se a tabela foi criada na seção "Table Editor"

### Verifique a Chave de Criptografia

Certifique-se de que a chave de criptografia está definida no arquivo de ambiente:

1. Abra `src/environments/environment.ts` (e `environment.development.ts`)
2. Verifique se a propriedade `ENCRYPTION_KEY` está definida:

```typescript
export const environment = {
  // outras propriedades
  ENCRYPTION_KEY: 'sua-chave-secreta-com-pelo-menos-32-caracteres'
};
```

## Problemas Comuns

### Erro: "invalid input syntax for type uuid"

Este erro ocorre quando um UUID vazio ou inválido é passado para o banco de dados. Causas comuns:

1. **Usuário não está autenticado**: Verifique se o usuário está corretamente autenticado
2. **ID incorreto**: Verifique se o ID do usuário ou da credencial está sendo corretamente passado

**Solução para desenvolvimento**:
- No serviço `GovCredentialsService` já existe um ID temporário para desenvolvimento
- Em ambientes de produção, certifique-se de que o serviço de autenticação está fornecendo o ID do usuário

### Erro ao Criptografar/Descriptografar Dados

Problemas com a criptografia podem ocorrer por várias razões:

1. **Chave inválida**: Verifique se a `ENCRYPTION_KEY` está configurada corretamente
2. **Algoritmo não suportado**: Verifique se o navegador suporta a API Web Crypto
3. **Dados corrompidos**: Os dados criptografados podem estar corrompidos

**Solução**:
- Certifique-se de que a `ENCRYPTION_KEY` tenha pelo menos 32 caracteres
- Verifique a compatibilidade do navegador com Web Crypto API
- Em último caso, pode ser necessário limpar dados antigos

### Tabela não Encontrada ou Política de Segurança

Erros de permissão ou tabelas não encontradas:

1. **Tabela não existe**: Execute o script SQL para criar a tabela
2. **Política RLS restritiva**: Verifique as políticas de segurança Row Level Security (RLS)

**Verificação de políticas**:
```sql
-- Execute no SQL Editor do Supabase
SELECT * FROM pg_policies WHERE tablename = 'gov_credentials';
```

### Erro em Relacionamentos de Tabelas

Se você encontrar erros relacionados à consulta SQL que busca credenciais dos clientes:

1. **Problema de relacionamentos de tabelas**: O método `getCredentialsForContador` pode falhar se os relacionamentos entre as tabelas não estiverem corretamente configurados ou se o modelo de dados for alterado.

**Sintomas**:
- Erro no console: `Cannot read properties of undefined (reading 'length')` 
- Contador não consegue ver nenhuma credencial mesmo quando há credenciais cadastradas

**Solução**:
- Verifique o método `getCredentialsForContador` no serviço `GovCredentialsService`
- A solução implementada utiliza uma abordagem em 3 passos para garantir consistência:
  1. Buscar todas as relações contador-cliente
  2. Buscar as credenciais dos clientes encontrados
  3. Buscar os perfis dos clientes para exibir informações adicionais

Exemplo de implementação correta:
```typescript
// Passo 1: Obter IDs dos clientes vinculados ao contador
const { data: clientesRelacionados } = await this.databaseService.supabase
  .from('contador_clientes')
  .select('cliente_id')
  .eq('contador_id', contadorId);

// Passo 2: Extrair IDs e buscar credenciais
const clienteIds = clientesRelacionados.map(rel => rel.cliente_id);
const { data: credenciais } = await this.databaseService.supabase
  .from('gov_credentials')
  .select('*')
  .in('cliente_id', clienteIds);
```

## Depuração do Módulo

Para ativar logs de depuração mais detalhados:

1. No navegador, abra as Ferramentas de Desenvolvedor (F12)
2. Vá para a aba "Console"
3. O serviço `GovCredentialsService` já inclui logs detalhados para ajudar na depuração

## Testando o Módulo

Para testes em ambiente de desenvolvimento:

1. Na página de listagem de credenciais, você deve ver credenciais salvas pelo usuário atual
2. No componente de formulário, você pode adicionar novas credenciais
3. Na página do contador, você deve ver as credenciais dos clientes vinculados

Caso encontre problemas específicos não cobertos neste guia, por favor reporte-os detalhadamente, incluindo:
- Mensagem de erro exata
- Ações executadas que levaram ao erro
- Versão do navegador e sistema operacional 