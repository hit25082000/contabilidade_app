# Módulo de Credenciais Governamentais

Este módulo permite o compartilhamento seguro de credenciais de acesso a portais governamentais entre clientes e contadores, proporcionando uma maneira segura de administrar informações sensíveis.

## Funcionalidades

### Para Clientes

- Cadastrar, editar e excluir credenciais governamentais
- Visualizar histórico de acesso às suas credenciais
- Interface intuitiva e segura para gerenciamento de dados sensíveis

### Para Contadores

- Visualizar credenciais compartilhadas pelos clientes
- Acessar as informações necessárias para operar nos portais governamentais
- Rastreamento transparente de todos os acessos

## Arquitetura Técnica

O módulo foi desenvolvido com as seguintes características:

- **Segurança**: Todas as credenciais são criptografadas antes de serem armazenadas no banco de dados
- **Auditoria**: Todos os acessos são registrados para garantir transparência
- **Escalabilidade**: A arquitetura permite fácil adição de novos tipos de credenciais
- **Manutenibilidade**: Código modular e bem documentado

### Componentes Principais

```
src/app/
├── core/
│   ├── models/
│   │   └── gov-credentials.model.ts    # Interfaces e tipos
│   └── services/
│       ├── gov-credentials.service.ts  # Serviço principal para CRUD
│       └── crypto.service.ts           # Serviço de criptografia
├── features/
│   ├── client/
│   │   ├── gov-credentials-list/       # Listagem para clientes
│   │   └── gov-credentials-form/       # Formulário para adicionar/editar
│   └── accountant/
│       └── gov-credentials-view/       # Visualização para contadores
└── shared/
    └── components/
        └── gov-credentials-help/       # Componente de ajuda reutilizável
```

### Banco de Dados

O módulo utiliza a tabela `gov_credentials` no Supabase:

```sql
CREATE TABLE public.gov_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES profiles(id),
    credential_name TEXT NOT NULL,
    encrypted_data TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    access_log JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE
);
```

## Guia de Uso

### Para Clientes

1. Acesse a página de credenciais governamentais no menu lateral
2. Clique em "Nova Credencial" para adicionar uma credencial
3. Preencha o formulário com as informações:
   - Nome da credencial (ex: "e-CAC CNPJ 12.345.678/0001-00")
   - Selecione o tipo de portal
   - Informações de acesso (usuário/senha/certificado)
4. Para editar, clique no ícone de edição ao lado da credencial
5. Para revogar acesso, clique no ícone de exclusão

### Para Contadores

1. Acesse a página de credenciais governamentais no menu lateral
2. Visualize a lista de clientes que compartilharam credenciais
3. Clique em uma credencial para acessar os detalhes
4. Utilize as informações para acessar os portais governamentais

## Solução de Problemas

Para solucionar problemas comuns relacionados ao módulo:

1. Consulte o arquivo de documentação em `supabase/docs/credenciais_governamentais.md`
2. Verifique se a tabela `gov_credentials` foi criada corretamente no Supabase
3. Certifique-se de que a chave de criptografia está definida nos arquivos de ambiente

## Desenvolvedores

- As principais classes e componentes incluem comentários detalhados
- A criptografia utiliza a Web Crypto API para máxima segurança
- O módulo inclui tratamento de erros em todos os níveis
- Um componente de ajuda reutilizável está disponível para todas as telas

## Próximos Passos

- Implementar exportação de credenciais para backup
- Adicionar suporte a mais tipos de portais governamentais
- Integrar com mecanismo de notificação para alertar clientes sobre acessos 