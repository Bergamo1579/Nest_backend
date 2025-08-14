# PROMPT PARA CRIAÇÃO DE FRONTEND - SISTEMA DE GESTÃO DE MENOR APRENDIZ

Crie um frontend React/Next.js completo para um sistema de gerenciamento educacional de menor aprendiz com as seguintes especificações:

## 📋 VISÃO GERAL DO SISTEMA

O sistema é uma plataforma educacional para gestão de menor aprendiz com 4 perfis distintos:
- **Administrador**: Gestão completa do sistema
- **Empresa**: Acompanhamento de alunos vinculados
- **Instrutor**: Liberação de acessos às aulas
- **Aluno**: Acesso ao conteúdo educacional

## 🔐 SISTEMA DE AUTENTICAÇÃO

### Endpoint de Login
```
POST /auth/login
Content-Type: application/json

Body:
{
  "username": "string",
  "password": "string"
}

Response:
{
  "token": "jwt_token",
  "user": {
    "id": "uuid",
    "username": "string", 
    "name": "string",
    "tipo": "administrador|empresa|instrutor|aluno"
  }
}
```

### Fluxo de Autenticação
1. Login único para todos os perfis
2. Redirecionamento baseado no campo `tipo`
3. JWT token para todas as requisições subsequentes
4. Sistema especial de senha temporária para alunos

### Tratamento de Erros de Login
- Rate limiting: 5 tentativas por usuário
- Bloqueio de 5 minutos após excesso de tentativas
- Headers necessários: `Authorization: Bearer {token}`

## 👨‍💼 PERFIL ADMINISTRADOR - Dashboard Completo

### Endpoints de Gestão de Unidades
```
GET    /unidades                    # Listar unidades
POST   /unidades                    # Criar unidade
PUT    /unidades/:id                # Atualizar unidade
DELETE /unidades/:id                # Deletar unidade
GET    /unidades/:id                # Buscar unidade específica
```

### Endpoints de Gestão de Empresas  
```
GET    /empresas                    # Listar empresas
POST   /empresas                    # Criar empresa
PUT    /empresas/:id                # Atualizar empresa
DELETE /empresas/:id                # Deletar empresa
GET    /empresas/:id                # Buscar empresa específica
```

### Endpoints de Gestão de Turmas
```
GET    /turmas                      # Listar turmas
POST   /turmas                      # Criar turma
PUT    /turmas/:id                  # Atualizar turma
DELETE /turmas/:id                  # Deletar turma
GET    /turmas/:id                  # Buscar turma específica

# Filtros disponíveis:
# ?unidade_id=uuid - Filtrar por unidade
```

### Endpoints de Gestão de Instrutores
```
GET    /instrutores                 # Listar instrutores
POST   /instrutores                 # Criar instrutor
PUT    /instrutores/:id             # Atualizar instrutor
DELETE /instrutores/:id             # Deletar instrutor
GET    /instrutores/:id             # Buscar instrutor específico
```

### Endpoints de Gestão de Alunos
```
GET    /alunos                      # Listar alunos
POST   /alunos                      # Criar aluno
PUT    /alunos/:id                  # Atualizar aluno
DELETE /alunos/:id                  # Deletar aluno
GET    /alunos/:id                  # Buscar aluno específico

# Filtros avançados disponíveis:
# ?unidade_id=uuid
# ?turma_id=uuid
# ?empresa_id=uuid
# ?nome=string
# ?cpf=string
```

### 🎓 GESTÃO DE ALUNOS - MANUAL COMPLETO DE ENDPOINTS

#### 📋 Listar Alunos com Filtros Avançados

```typescript
// Endpoint base
GET /alunos

// Headers obrigatórios
Authorization: Bearer {jwt_token}

// Query Parameters disponíveis
interface AlunosQueryParams {
  // Paginação
  page?: string;           // Número da página (padrão: 1)
  limit?: string;          // Itens por página (padrão: 10)
  
  // Filtros de identificação
  id?: string;             // ID específico do aluno
  nome?: string;           // Busca parcial por nome
  cpf?: string;            // CPF específico (com ou sem máscara)
  
  // Filtros de relacionamento
  unidade_id?: string;     // Filtrar por unidade específica
  turma_id?: string;       // Filtrar por turma específica
  empresa_id?: string;     // Filtrar por empresa específica
  
  // Filtros pessoais
  responsavel_nome?: string; // Nome do responsável
  sexo?: 'M' | 'F';         // Gênero
  rg?: string;              // RG específico
  
  // Filtros de localização
  cidade?: string;          // Cidade
  bairro?: string;          // Bairro
  
  // Filtros educacionais
  escola?: string;          // Nome da escola
  serie?: string;           // Série escolar
  periodo?: 'manha' | 'tarde' | 'noite'; // Período de estudo
}
```

#### Exemplos de Uso - Listar Alunos

```typescript
// 1. Listar todos os alunos (paginado)
GET /alunos?page=1&limit=20

// 2. Buscar alunos por nome
GET /alunos?nome=maria

// 3. Filtrar alunos de uma unidade específica
GET /alunos?unidade_id=uuid-unidade-123

// 4. Filtrar alunos de uma empresa específica
GET /alunos?empresa_id=uuid-empresa-456

// 5. Combinando filtros - alunos do sexo feminino de uma turma
GET /alunos?turma_id=uuid-turma-789&sexo=F

// 6. Buscar alunos por cidade e período
GET /alunos?cidade=São Paulo&periodo=manha

// 7. Filtro complexo - empresa + unidade + período
GET /alunos?empresa_id=uuid-empresa&unidade_id=uuid-unidade&periodo=tarde

// Response esperado (lista resumida)
[
  {
    "id": "uuid-aluno-1",
    "nome": "Maria Silva",
    "cpf": "123.456.789-00",
    "data_nascimento": "2005-04-23",
    "empresa_id": "uuid-empresa",
    "unidade_id": "uuid-unidade",
    "turma_id": "uuid-turma"
  }
]
```

#### 👤 Buscar Aluno Específico

```typescript
GET /alunos/{id}

// Headers
Authorization: Bearer {jwt_token}

// Response completo com todos os dados
{
  "aluno_id": "uuid",
  "aluno_nome": "Maria Silva",
  "aluno_cpf": "12345678900",
  "aluno_data_nascimento": "2005-04-23T00:00:00.000Z",
  "aluno_unidade_id": "uuid-unidade",
  "aluno_turma_id": "uuid-turma", 
  "aluno_empresa_id": "uuid-empresa",
  "aluno_criado_em": "2024-01-15T10:30:00.000Z",
  "aluno_atualizado_em": "2024-01-15T10:30:00.000Z",
  "aluno_responsavel_nome": "João Silva",
  "aluno_sexo": "F",
  "aluno_rg": "123456789",
  "aluno_endereco": "Rua das Flores, 123",
  "aluno_numero": "123",
  "aluno_complemento": "Apto 45",
  "aluno_bairro": "Centro",
  "aluno_cidade": "São Paulo",
  "aluno_cep": "01000000",
  "aluno_celular": "11999999999",
  "aluno_celular_recado": "11988888888",
  "aluno_email": "maria@email.com",
  "aluno_escola": "Escola Estadual",
  "aluno_serie": "8ª série",
  "aluno_periodo": "manha"
}
```

#### ➕ Criar Novo Aluno

```typescript
POST /alunos
Content-Type: application/json
Authorization: Bearer {jwt_token}

// Body obrigatório
{
  "nome": "string",              // OBRIGATÓRIO
  "cpf": "string",               // OBRIGATÓRIO (será usado como username)
  "data_nascimento": "string",   // OBRIGATÓRIO (formato: YYYY-MM-DD)
  "empresa_id": "string"         // OBRIGATÓRIO
}

// Body completo com todos os campos opcionais
{
  // Campos obrigatórios
  "nome": "Maria Silva",
  "cpf": "123.456.789-00",        // Aceita com ou sem máscara
  "data_nascimento": "2005-04-23",
  "empresa_id": "uuid-empresa",
  
  // Campos opcionais de relacionamento
  "unidade_id": "uuid-unidade",   // Pode ser null
  "turma_id": "uuid-turma",       // Pode ser null
  
  // Dados pessoais opcionais
  "responsavel_nome": "João Silva",
  "sexo": "F",                    // 'M' ou 'F'
  "rg": "12.345.678-9",
  
  // Endereço (todos opcionais)
  "endereco": "Rua das Flores, 123",
  "numero": "123",
  "complemento": "Apto 45",
  "bairro": "Centro",
  "cidade": "São Paulo",
  "cep": "01000-000",             // Aceita com ou sem máscara
  
  // Contatos (opcionais)
  "celular": "(11) 99999-9999",
  "celular_recado": "(11) 98888-8888",
  "email": "maria@email.com",
  
  // Dados educacionais (opcionais)
  "escola": "Escola Estadual Exemplo",
  "serie": "8ª série",
  "periodo": "manha"              // 'manha', 'tarde' ou 'noite'
}

// Response: retorna o aluno criado
{
  "id": "uuid-gerado",
  "nome": "Maria Silva",
  "cpf": "12345678900",
  // ... outros campos
}
```

#### ✏️ Atualizar Aluno

```typescript
PUT /alunos/{id}
Content-Type: application/json
Authorization: Bearer {jwt_token}

// Body: Todos os campos são opcionais (PartialType)
{
  "nome": "Maria Silva Santos",    // Atualiza nome e username na tabela auth
  "cpf": "987.654.321-00",        // Atualiza username na tabela auth
  "data_nascimento": "2005-05-15", // Atualiza senha na tabela auth
  "unidade_id": "nova-unidade",
  "turma_id": "nova-turma",
  "empresa_id": "nova-empresa",
  "responsavel_nome": "Pedro Silva",
  "sexo": "F",
  "endereco": "Nova Rua, 456",
  "celular": "(11) 91234-5678",
  "email": "maria.santos@email.com",
  "escola": "Nova Escola",
  "serie": "1º ano",
  "periodo": "tarde"
}

// Response: retorna dados completos atualizados
{
  "aluno_id": "uuid",
  "aluno_nome": "Maria Silva Santos",
  // ... todos os campos atualizados
}
```

#### 🗑️ Deletar Aluno

```typescript
DELETE /alunos/{id}
Authorization: Bearer {jwt_token}

// Response: 200 OK (sem body)
// Remove dados de:
// - Tabela alunos
// - Tabela auth (usuário)
// - Tabela user_access_levels (permissões)
```

#### 🔐 Acesso Temporário à Aula (Endpoint Especial)

```typescript
POST /alunos/acessar-aula
Content-Type: application/json
Authorization: Bearer {jwt_token}  // Token do ALUNO

// Body
{
  "aula_id": "uuid-aula",
  "temp_password": "123456"    // Senha criada pelo instrutor
}

// Response de sucesso
{
  "id": "uuid-acesso",
  "aluno_id": "uuid-aluno",
  "aula_id": "uuid-aula", 
  "criado_em": "2024-01-15T10:30:00.000Z"
}

// Errors possíveis
// 401: "Apenas alunos podem validar acesso temporário"
// 404: "Acesso temporário não encontrado para este aluno e aula"  
// 401: "Acesso temporário expirado" (após 2 minutos)
// 401: "Senha temporária inválida"
```

### 🔄 Cenários Específicos de Uso - Alunos

#### Cenário 1: Administrador Gerenciando Alunos

```typescript
// 1. Listar todos os alunos para overview
const todosAlunos = await fetch('/alunos?page=1&limit=50', {
  headers: { Authorization: `Bearer ${adminToken}` }
});

// 2. Filtrar alunos por empresa para relatório
const alunosEmpresa = await fetch('/alunos?empresa_id=uuid-empresa-123', {
  headers: { Authorization: `Bearer ${adminToken}` }
});

// 3. Buscar alunos de uma unidade específica
const alunosUnidade = await fetch('/alunos?unidade_id=uuid-unidade-456', {
  headers: { Authorization: `Bearer ${adminToken}` }
});

// 4. Criar novo aluno com dados completos
const novoAluno = await fetch('/alunos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    nome: "Ana Costa",
    cpf: "111.222.333-44",
    data_nascimento: "2006-03-15",
    empresa_id: "uuid-empresa",
    unidade_id: "uuid-unidade",
    turma_id: "uuid-turma",
    responsavel_nome: "Carlos Costa",
    sexo: "F",
    endereco: "Av. Principal, 789",
    cidade: "Rio de Janeiro",
    celular: "(21) 98765-4321",
    email: "ana@email.com",
    escola: "Colégio Municipal",
    periodo: "tarde"
  })
});

// 5. Atualizar dados do aluno
const alunoAtualizado = await fetch('/alunos/uuid-aluno', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    turma_id: "nova-turma-uuid",
    periodo: "manha",
    celular: "(21) 91111-2222"
  })
});
```

#### Cenário 2: Empresa Visualizando Seus Alunos

```typescript
// Empresa vê apenas seus próprios alunos
const alunosDaEmpresa = await fetch(`/alunos?empresa_id=${empresaId}`, {
  headers: { Authorization: `Bearer ${empresaToken}` }
});

// Buscar dados completos de um aluno específico
const alunoDetalhado = await fetch(`/alunos/${alunoId}`, {
  headers: { Authorization: `Bearer ${empresaToken}` }
});
```

#### Cenário 3: Instrutor Vendo Alunos da Unidade

```typescript
// Instrutor vê alunos da sua unidade para liberar acesso
const alunosUnidade = await fetch(`/alunos?unidade_id=${instrutorUnidadeId}`, {
  headers: { Authorization: `Bearer ${instrutorToken}` }
});

// Criar senha temporária (endpoint no controller de instrutores)
const senhaTemporaria = await fetch('/instrutores/acesso-temporario', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${instrutorToken}`
  },
  body: JSON.stringify({
    aluno_id: "uuid-aluno",
    aula_id: "uuid-aula",
    temp_password: "123456"
  })
});
```

#### Cenário 4: Aluno Acessando Aula

```typescript
// Aluno valida senha temporária para acessar aula
const acessoValidado = await fetch('/alunos/acessar-aula', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${alunoToken}`
  },
  body: JSON.stringify({
    aula_id: "uuid-aula",
    temp_password: "123456"
  })
});
```

### 🛡️ Regras de Negócio - Alunos

#### Autenticação Automática
- **Username**: CPF sem máscara (apenas números)
- **Senha inicial**: Data de nascimento formato DDMMAAAA
- **Role**: Aluno (role_id: 1)
- **Access Level**: Nível 1 de acesso

#### Validações de Campos
```typescript
interface AlunoValidations {
  nome: {
    required: true,
    maxLength: 150,
    pattern: /^[a-zA-ZÀ-ÿ\s]+$/  // Apenas letras e espaços
  },
  cpf: {
    required: true,
    unique: true,
    pattern: /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/,
    length: 11  // Após remover máscara
  },
  data_nascimento: {
    required: true,
    format: 'YYYY-MM-DD',
    maxAge: 25,  // Menor aprendiz
    minAge: 14
  },
  empresa_id: {
    required: true,
    foreignKey: 'empresas.id'
  },
  unidade_id: {
    optional: true,
    foreignKey: 'unidades.id'
  },
  turma_id: {
    optional: true,
    foreignKey: 'turmas.id'
  },
  email: {
    optional: true,
    format: 'email',
    maxLength: 100
  },
  celular: {
    optional: true,
    pattern: /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/
  },
  sexo: {
    optional: true,
    enum: ['M', 'F']
  },
  periodo: {
    optional: true,
    enum: ['manha', 'tarde', 'noite']
  }
}
```

#### Estados de Aluno
```typescript
interface AlunoStatus {
  // Relacionamentos opcionais
  semUnidade: boolean;     // unidade_id é null
  semTurma: boolean;       // turma_id é null
  
  // Status de dados
  dadosCompletos: boolean; // Todos campos obrigatórios preenchidos
  enderecoCompleto: boolean; // Endereço completo
  contatosCompletos: boolean; // Telefones e email
  
  // Status educacional
  dadosEscolares: boolean; // Escola, série, período definidos
}
```

### 📊 Componentes Frontend Sugeridos - Alunos

#### Lista de Alunos
```typescript
interface AlunosList {
  // Filtros avançados
  filters: {
    nome: string;
    unidade: string;
    turma: string;
    empresa: string;
    periodo: 'manha' | 'tarde' | 'noite' | '';
    sexo: 'M' | 'F' | '';
  };
  
  // Paginação
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  
  // Ações
  actions: {
    create: () => void;
    edit: (id: string) => void;
    delete: (id: string) => void;
    view: (id: string) => void;
    exportCsv: () => void;
    importCsv: () => void;
  };
}
```

#### Formulário de Aluno
```typescript
interface AlunoForm {
  mode: 'create' | 'edit';
  initialData?: Partial<Aluno>;
  
  sections: {
    dadosPessoais: {
      nome: string;
      cpf: string;
      data_nascimento: string;
      sexo: 'M' | 'F';
      rg: string;
    };
    
    responsavel: {
      responsavel_nome: string;
    };
    
    relacionamentos: {
      empresa_id: string;
      unidade_id?: string;
      turma_id?: string;
    };
    
    endereco: {
      endereco: string;
      numero: string;
      complemento: string;
      bairro: string;
      cidade: string;
      cep: string;
    };
    
    contatos: {
      celular: string;
      celular_recado: string;
      email: string;
    };
    
    educacional: {
      escola: string;
      serie: string;
      periodo: 'manha' | 'tarde' | 'noite';
    };
  };
}
```

#### Dashboard de Alunos (Admin)
```typescript
interface AlunosDashboard {
  statistics: {
    totalAlunos: number;
    alunosPorUnidade: Array<{unidade: string, count: number}>;
    alunosPorEmpresa: Array<{empresa: string, count: number}>;
    alunosPorPeriodo: {manha: number, tarde: number, noite: number};
    idadeMedia: number;
    distribucaoSexo: {masculino: number, feminino: number};
  };
  
  recentActions: Array<{
    action: 'create' | 'update' | 'delete';
    aluno: string;
    timestamp: Date;
    user: string;
  }>;
  
  alerts: Array<{
    type: 'warning' | 'error' | 'info';
    message: string;
    alunoId?: string;
  }>;
}
```

### 🎯 Casos de Uso Específicos

#### Migração de Aluno entre Turmas
```typescript
// 1. Buscar aluno atual
const aluno = await fetch(`/alunos/${alunoId}`);

// 2. Atualizar para nova turma
const alunoAtualizado = await fetch(`/alunos/${alunoId}`, {
  method: 'PUT',
  body: JSON.stringify({
    turma_id: novaTurmaId,
    unidade_id: novaUnidadeId  // Se necessário
  })
});
```

#### Relatório de Alunos por Empresa
```typescript
// 1. Buscar todas as empresas
const empresas = await fetch('/empresas');

// 2. Para cada empresa, buscar alunos
const relatorio = await Promise.all(
  empresas.map(async (empresa) => {
    const alunos = await fetch(`/alunos?empresa_id=${empresa.id}`);
    return {
      empresa: empresa.nome,
      totalAlunos: alunos.length,
      alunosDetalhados: alunos
    };
  })
);
```

#### Validação de Acesso Temporário
```typescript
// Interface do componente de acesso
interface AcessoTemporario {
  alunoId: string;
  aulaId: string;
  senhaTemporaria: string;
  expiresAt: Date;
  
  // Método de validação
  validarAcesso: () => Promise<boolean>;
  
  // Timer de expiração
  timeRemaining: number; // em segundos
}
```

### Endpoints de Gestão de Aulas (Estilo Moodle)
```
GET    /aulas                       # Listar aulas
POST   /aulas                       # Criar aula (multipart/form-data)
PUT    /aulas/:id                   # Atualizar aula
DELETE /aulas/:id                   # Deletar aula
GET    /aulas/:id                   # Buscar aula específica
GET    /aulas/aula-resultado        # Resultados de aluno por aula

# Criar aula (com upload de imagem obrigatório):
POST /aulas
Content-Type: multipart/form-data
{
  "titulo": "string",
  "descricao": "string", 
  "file": "image_file"    # Obrigatório
}
```

### Endpoints de Gestão de Conteúdo das Aulas
```
# Adicionar conteúdos à aula:
POST   /conteudo/:aula_id/texto     # Adicionar texto
POST   /conteudo/:aula_id/imagem    # Upload de imagem
POST   /conteudo/:aula_id/link      # Adicionar vídeo/link
POST   /conteudo/:aula_id/arquivo   # Upload de arquivo PDF/Word/PPT

# Gerenciar conteúdos:
GET    /conteudo/aula/:aula_id      # Listar conteúdos da aula
PUT    /conteudo/:conteudo_id       # Atualizar conteúdo
DELETE /conteudo/:id               # Remover conteúdo
PUT    /conteudo/reorder/:aula_id  # Reordenar conteúdos

# Exemplo de adição de texto:
POST /conteudo/:aula_id/texto
{
  "texto": "Conteúdo da aula..."
}

# Exemplo de adição de link/vídeo:
POST /conteudo/:aula_id/link  
{
  "url": "https://youtube.com/watch?v=...",
  "descricao": "Vídeo explicativo"
}

# Upload de imagem:
POST /conteudo/:aula_id/imagem
Content-Type: multipart/form-data
{
  "arquivo": "image_file",
  "descricao": "Descrição da imagem",
  "ordem": 1
}

# Reordenar conteúdos:
PUT /conteudo/reorder/:aula_id
{
  "reorder": [
    {"conteudo_id": "uuid1", "nova_ordem": 1},
    {"conteudo_id": "uuid2", "nova_ordem": 2}
  ]
}
```

### Endpoints de Gestão de Atividades
```
GET    /atividades?aula_id=uuid     # Listar atividades da aula
POST   /atividades                  # Criar atividade
PUT    /atividades/:id              # Atualizar atividade
DELETE /atividades/:id              # Deletar atividade
GET    /atividades/:id              # Buscar atividade específica

# Criar atividade mista (múltipla escolha + abertas):
POST /atividades
{
  "aula_id": "uuid",
  "titulo": "Atividade 1",
  "tipo_atividade": "mista",
  "perguntas_multipla": [
    {
      "numero_questao": 1,
      "texto_pergunta": "Qual a capital do Brasil?",
      "respostas": [
        {"opcao": "A", "texto_resposta": "São Paulo"},
        {"opcao": "B", "texto_resposta": "Brasília"},
        {"opcao": "C", "texto_resposta": "Rio de Janeiro"}
      ],
      "resposta_correta": "B"
    }
  ],
  "perguntas_objetiva": [
    {
      "texto_questao": "Descreva a importância da educação."
    }
  ]
}
```

### Endpoints de Agendamento de Aulas
```
GET    /turma_aula                  # Listar agendamentos
POST   /turma_aula                  # Criar agendamento
PUT    /turma_aula/:id/data-horario # Editar agendamento
DELETE /turma_aula/:id              # Excluir agendamento

# Filtros para agendamentos:
GET    /turma_aula/turma/:turma_id           # Por turma
GET    /turma_aula/unidade/:unidade_id       # Por unidade  
GET    /turma_aula/dia/:data_aula            # Por dia
GET    /turma_aula/ativos                    # Aulas ativas agora
GET    /turma_aula/ativos/turma/:turma_id    # Ativas por turma

# Criar agendamento:
POST /turma_aula
{
  "turma_id": "uuid",
  "aula_id": "uuid", 
  "data_aula": "2024-01-15",
  "horario_inicio": "08:00:00",
  "horario_fim": "10:00:00"
}
```

## 🏢 PERFIL EMPRESA - Dashboard de Acompanhamento

### Acesso Limitado
- Apenas visualização de dados dos próprios alunos
- Não pode criar/editar/deletar recursos
- Foco em relatórios de presença e desempenho

### Endpoints Disponíveis para Empresa
```
GET    /alunos?empresa_id=:empresa_id    # Alunos da empresa
GET    /aulas/aula-resultado             # Resultados dos alunos
```

### Interface Necessária
- **Dashboard**: Lista dos alunos vinculados à empresa
- **Relatórios de Presença**: Tabela com presença por aluno/aula
- **Performance**: Gráficos de aproveitamento dos alunos da empresa

## 👨‍🏫 PERFIL INSTRUTOR - Liberação de Acessos

### Função Principal
O instrutor é responsável por liberar aulas ativas para alunos da sua unidade através de senhas temporárias.

### Endpoints do Instrutor
```
# Listar aulas ativas no momento atual:
GET    /turma_aula/ativos/instrutor/:instrutor_id/unidade/:unidade_id

# Criar senha temporária para aluno:
POST   /instrutores/acesso-temporario
{
  "aluno_id": "uuid",
  "aula_id": "uuid", 
  "temp_password": "123456"    # Senha temporária em texto
}

# Listar alunos da unidade do instrutor:
GET    /alunos?unidade_id=:unidade_id
```

### Fluxo de Trabalho do Instrutor
1. Ver aulas ativas no momento (filtradas por sua unidade)
2. Selecionar uma aula ativa
3. Ver lista de alunos elegíveis (mesma unidade)
4. Gerar senha temporária para aluno específico
5. Aluno usa essa senha para acessar a aula

### Interface Necessária
- **Dashboard**: Aulas ativas no momento atual
- **Liberação de Acesso**: 
  - Lista de aulas ativas
  - Lista de alunos da unidade
  - Gerador de senha temporária
  - Status de acessos criados (últimos 2 minutos)

## 🎓 PERFIL ALUNO - Interface de Aprendizagem

### Acesso Controlado por Tempo e Senha
- Vê apenas aulas agendadas para o horário atual
- Precisa de senha temporária do instrutor para acessar
- Faz atividades que geram presença e nota

### Endpoints do Aluno
```
# Aulas disponíveis no horário atual:
GET    /turma_aula/ativos/aluno/:aluno_id

# Validar senha temporária:
POST   /alunos/acessar-aula
{
  "aula_id": "uuid",
  "temp_password": "123456"
}

# Visualizar conteúdo da aula:
GET    /conteudo/aula/:aula_id

# Buscar atividade da aula:
GET    /atividades?aula_id=:aula_id

# Responder atividades:
POST   /atividades/responder-multipla    # Questão múltipla escolha
POST   /atividades/responder-aberta      # Questão aberta
POST   /atividades/responder-completa    # Atividade inteira

# Ver resultados:
GET    /atividades/:id_atividade/resultado/:id_aluno
```

### Fluxo do Aluno
1. Login no sistema
2. Ver aulas disponíveis no horário atual
3. Solicitar senha temporária ao instrutor
4. Inserir senha para acessar aula
5. Visualizar conteúdo (textos, imagens, vídeos, arquivos)
6. Fazer atividades (múltipla escolha + questões abertas)
7. Ver feedback de respostas

### Responder Atividades
```
# Responder questão múltipla escolha individual:
POST /atividades/responder-multipla
{
  "id_atividade": "uuid",
  "id_pergunta": "uuid", 
  "id_aluno": "uuid",
  "resposta": "A"
}

# Responder questão aberta individual:
POST /atividades/responder-aberta
{
  "id_atividade": "uuid",
  "id_pergunta": "uuid",
  "id_aluno": "uuid", 
  "caminho_arquivo": "path/to/uploaded/file.pdf"
}

# Responder atividade completa:
POST /atividades/responder-completa
{
  "id_atividade": "uuid",
  "id_aluno": "uuid",
  "respostas": [
    {
      "id_pergunta": "uuid1",
      "resposta_multipla": "A"
    },
    {
      "id_pergunta": "uuid2", 
      "resposta_aberta": "path/to/file.pdf"
    }
  ]
}
```

## 🔄 CENÁRIOS DE USO E SEQUENCIAMENTO

### Cenário 1: Administrador Criando uma Aula Completa
```
1. POST /aulas (criar aula com imagem)
2. POST /conteudo/:aula_id/texto (adicionar texto introdutório)
3. POST /conteudo/:aula_id/link (adicionar vídeo do YouTube)
4. POST /conteudo/:aula_id/imagem (upload de imagem explicativa)
5. POST /conteudo/:aula_id/arquivo (upload de PDF de apoio)
6. POST /atividades (criar atividade mista)
7. POST /turma_aula (agendar aula para turma)
```

### Cenário 2: Instrutor Liberando Acesso
```
1. GET /turma_aula/ativos/instrutor/:id/unidade/:id (ver aulas ativas)
2. GET /alunos?unidade_id=:id (listar alunos da unidade)
3. POST /instrutores/acesso-temporario (criar senha para aluno)
```

### Cenário 3: Aluno Fazendo uma Aula
```
1. GET /turma_aula/ativos/aluno/:aluno_id (ver aulas disponíveis)
2. POST /alunos/acessar-aula (validar senha temporária)
3. GET /conteudo/aula/:aula_id (ver conteúdo da aula)
4. GET /atividades?aula_id=:aula_id (buscar atividades)
5. POST /atividades/responder-completa (responder atividade)
6. GET /atividades/:id/resultado/:aluno_id (ver resultado)
```

### Cenário 4: Empresa Acompanhando Alunos
```
1. GET /alunos?empresa_id=:empresa_id (listar alunos da empresa)
2. GET /aulas/aula-resultado?aula_id=:id&id_aluno=:id (ver resultados)
```

## 🎨 ESPECIFICAÇÕES DE INTERFACE

### Design System
- **Paleta**: Azuis educacionais (#1e40af, #3b82f6, #93c5fd)
- **Tipografia**: Inter ou similar, clara e legível
- **Ícones**: Heroicons ou Lucide React
- **Framework**: Tailwind CSS
- **Componentes**: shadcn/ui recomendado

### Componentes Específicos Necessários

#### Editor de Aula (Administrador)
```typescript
interface AulaEditor {
  // Rich text editor para textos
  // Upload de imagens com preview
  // Campo para links de vídeo com preview embarcado
  // Upload de arquivos PDF/Word/PowerPoint
  // Lista ordenável de conteúdos (react-beautiful-dnd)
  // Criador de atividades misto
}
```

#### Visualizador de Aula (Aluno)
```typescript
interface AulaViewer {
  // Player responsivo para vídeos embarcados
  // Leitor de PDF embarcado (react-pdf)
  // Carrossel de imagens
  // Interface limpa para texto
  // Progress bar de conclusão
}
```

#### Sistema de Atividades
```typescript
interface AtividadeInterface {
  // Quiz interativo múltipla escolha
  // Zona de upload para questões abertas
  // Feedback visual de correto/incorreto
  // Progress bar de progresso
}
```

#### Gerador de Senha Temporária (Instrutor)
```typescript
interface SenhaTemporaria {
  // Lista de aulas ativas
  // Lista de alunos elegíveis  
  // Gerador de senha aleatória
  // Timer de expiração (2 minutos)
  // Status visual de senhas ativas
}
```

### Estados da Aplicação
```typescript
// Use Zustand ou Context API
interface AppState {
  user: {
    id: string;
    name: string;
    tipo: 'administrador' | 'empresa' | 'instrutor' | 'aluno';
    token: string;
  };
  currentAula?: {
    id: string;
    titulo: string;
    conteudos: Conteudo[];
    atividades: Atividade[];
  };
  senhasTemporarias: {
    [key: string]: {
      senha: string;
      expira: Date;
      aluno_id: string;
      aula_id: string;
    }
  };
}
```

### Responsividade
- **Mobile First**: Começar design para mobile
- **Breakpoints**: sm:640px, md:768px, lg:1024px, xl:1280px
- **Menu**: Hamburguer para mobile, sidebar para desktop
- **Cards**: Layout flexível que se adapta ao espaço

### Uploads e Arquivos
```typescript
// Configurações de upload
const uploadConfig = {
  maxSize: {
    image: 5 * 1024 * 1024,      // 5MB para imagens
    document: 10 * 1024 * 1024,  // 10MB para documentos
  },
  allowedTypes: {
    image: ['image/jpeg', 'image/png', 'image/gif'],
    document: ['application/pdf', 'application/msword', 
               'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  }
};
```

### Autenticação e Interceptadores
```typescript
// Axios interceptor para JWT
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para erros de autenticação
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirecionar para login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## 🚨 REGRAS DE NEGÓCIO IMPORTANTES

### Senhas Temporárias
- **Expiração**: 2 minutos após criação
- **Scope**: Específica para aluno + aula
- **Validação**: Apenas alunos da mesma unidade do instrutor

### Acesso às Aulas
- **Horário**: Aluno vê apenas aulas no horário atual
- **Autorização**: Precisa de senha temporária válida
- **Presença**: Registrada ao acessar + fazer atividade

### Atividades
- **Tipos**: Múltipla escolha (A,B,C,D,E) + Questões abertas
- **Tentativas**: Uma tentativa por aluno por atividade
- **Feedback**: Imediato para múltipla escolha

### Permissões por Perfil
- **Administrador**: CRUD completo de todos os recursos
- **Empresa**: Apenas leitura dos próprios alunos
- **Instrutor**: Apenas liberação de acesso da própria unidade
- **Aluno**: Apenas acesso ao conteúdo liberado

## 📱 ESTRUTURA DE ROTAS SUGERIDA

```
/login                          # Login único
/admin/dashboard                # Dashboard administrador
/admin/unidades                 # CRUD unidades
/admin/empresas                 # CRUD empresas  
/admin/turmas                   # CRUD turmas
/admin/instrutores              # CRUD instrutores
/admin/alunos                   # CRUD alunos
/admin/aulas                    # Lista de aulas
/admin/aulas/criar              # Editor de aula
/admin/aulas/:id/editar         # Editor de aula
/admin/agendamentos             # Calendário de agendamentos
/admin/relatorios               # Dashboard de relatórios

/empresa/dashboard              # Dashboard empresa
/empresa/alunos                 # Lista alunos da empresa
/empresa/relatorios             # Relatórios de presença

/instrutor/dashboard            # Dashboard instrutor
/instrutor/liberacao            # Interface de liberação

/aluno/dashboard                # Dashboard aluno
/aluno/aulas                    # Aulas disponíveis
/aluno/aula/:id                 # Visualizador de aula
/aluno/atividade/:id            # Interface de atividade
/aluno/resultados               # Meus resultados
```

## 🛠️ STACK TECNOLÓGICO RECOMENDADA

### Core
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Componentes**: shadcn/ui
- **Estado**: Zustand
- **HTTP**: Axios
- **Formulários**: React Hook Form + Zod

### Funcionalidades Específicas
- **Upload**: react-dropzone
- **Drag & Drop**: @dnd-kit/core
- **PDF Viewer**: react-pdf
- **Rich Text**: Tiptap ou Quill
- **Calendário**: react-big-calendar
- **Gráficos**: Chart.js ou Recharts
- **Notificações**: react-hot-toast

### Estrutura de Pastas
```
src/
├── app/                    # Next.js App Router
├── components/             # Componentes reutilizáveis
│   ├── ui/                # Componentes base (shadcn/ui)
│   ├── forms/             # Formulários específicos
│   ├── admin/             # Componentes do admin
│   ├── empresa/           # Componentes da empresa
│   ├── instrutor/         # Componentes do instrutor
│   └── aluno/             # Componentes do aluno
├── lib/                   # Utilitários e configurações
├── hooks/                 # Custom hooks
├── stores/                # Zustand stores
├── types/                 # TypeScript types
└── utils/                 # Funções utilitárias
```

Este sistema implementa um fluxo completo de gestão educacional com controle rigoroso de acesso e tempo, permitindo rastreamento detalhado de presença e desempenho dos alunos menores aprendizes.

### 🎯 GESTÃO DE ATIVIDADES - MANUAL COMPLETO DE ENDPOINTS

#### 📚 Visão Geral do Sistema de Atividades

O sistema de atividades permite criar avaliações mistas com:
- **Questões de Múltipla Escolha**: A, B, C, D, E com gabarito automático
- **Questões Abertas/Objetivas**: Upload de arquivos para respostas livres
- **Atividades Mistas**: Combinação dos dois tipos
- **Correção Automática**: Para múltipla escolha com feedback imediato
- **Tentativa Única**: Cada aluno pode responder apenas uma vez

#### 📝 Criar Nova Atividade

```typescript
POST /atividades
Content-Type: application/json
Authorization: Bearer {jwt_token}

// Estrutura completa do body
interface CreateAtividadeDto {
  aula_id: string;                    // OBRIGATÓRIO - UUID da aula
  titulo: string;                     // OBRIGATÓRIO - Nome da atividade
  tipo_atividade: 'multipla' | 'objetiva' | 'mista'; // OBRIGATÓRIO
  perguntas_multipla?: Array<{        // OPCIONAL - Para múltipla escolha
    numero_questao: number;
    texto_pergunta: string;
    respostas: Array<{
      opcao: 'A' | 'B' | 'C' | 'D' | 'E';
      texto_resposta: string;
    }>;
    resposta_correta: 'A' | 'B' | 'C' | 'D' | 'E';
  }>;
  perguntas_objetiva?: Array<{        // OPCIONAL - Para questões abertas
    texto_questao: string;
  }>;
}
```

#### Exemplos de Criação - Diferentes Tipos

```typescript
// 1. Atividade APENAS Múltipla Escolha
const atividadeMultipla = {
  "aula_id": "uuid-aula-123",
  "titulo": "Quiz de Matemática Básica",
  "tipo_atividade": "multipla",
  "perguntas_multipla": [
    {
      "numero_questao": 1,
      "texto_pergunta": "Quanto é 2 + 2?",
      "respostas": [
        {"opcao": "A", "texto_resposta": "3"},
        {"opcao": "B", "texto_resposta": "4"},
        {"opcao": "C", "texto_resposta": "5"},
        {"opcao": "D", "texto_resposta": "6"}
      ],
      "resposta_correta": "B"
    },
    {
      "numero_questao": 2,
      "texto_pergunta": "Qual é a capital da França?",
      "respostas": [
        {"opcao": "A", "texto_resposta": "Londres"},
        {"opcao": "B", "texto_resposta": "Madrid"},
        {"opcao": "C", "texto_resposta": "Paris"},
        {"opcao": "D", "texto_resposta": "Roma"},
        {"opcao": "E", "texto_resposta": "Berlim"}
      ],
      "resposta_correta": "C"
    }
  ]
};

// 2. Atividade APENAS Objetiva/Aberta
const atividadeAberta = {
  "aula_id": "uuid-aula-456",
  "titulo": "Redação sobre Sustentabilidade",
  "tipo_atividade": "objetiva",
  "perguntas_objetiva": [
    {
      "texto_questao": "Escreva um texto de no mínimo 200 palavras sobre a importância da sustentabilidade ambiental."
    },
    {
      "texto_questao": "Cite 3 exemplos práticos de como você pode contribuir para um mundo mais sustentável."
    }
  ]
};

// 3. Atividade MISTA (Múltipla + Aberta)
const atividadeMista = {
  "aula_id": "uuid-aula-789",
  "titulo": "Avaliação Completa de História",
  "tipo_atividade": "mista",
  "perguntas_multipla": [
    {
      "numero_questao": 1,
      "texto_pergunta": "Em que ano foi descoberto o Brasil?",
      "respostas": [
        {"opcao": "A", "texto_resposta": "1498"},
        {"opcao": "B", "texto_resposta": "1500"},
        {"opcao": "C", "texto_resposta": "1502"},
        {"opcao": "D", "texto_resposta": "1504"}
      ],
      "resposta_correta": "B"
    }
  ],
  "perguntas_objetiva": [
    {
      "texto_questao": "Descreva os principais impactos da colonização portuguesa no Brasil."
    },
    {
      "texto_questao": "Faça uma linha do tempo com os principais eventos do período colonial."
    }
  ]
};

// Response esperado para qualquer tipo
{
  "id_atividade": "uuid-gerado",
  "aula_id": "uuid-aula",
  "titulo": "Nome da Atividade",
  "id_tipo_atividade": "1", // 1=multipla, 2=objetiva
  "perguntasMultipla": [
    {
      "id_pergunta": "uuid-pergunta",
      "numero_questao": 1,
      "texto_pergunta": "Pergunta...",
      "respostas": [{
        "id_resposta": "uuid-resposta",
        "alternativa_a": "Texto A",
        "alternativa_b": "Texto B",
        // ... outras alternativas
      }]
      // Gabarito NÃO é retornado para alunos
    }
  ],
  "perguntasObjetiva": [
    {
      "id_pergunta": "uuid-pergunta",
      "texto_questao": "Pergunta aberta..."
    }
  ]
}
```

#### 📖 Listar Atividades

```typescript
// Listar atividades de uma aula específica
GET /atividades?aula_id={uuid}
Authorization: Bearer {jwt_token}

// Listar todas as atividades (apenas admin)
GET /atividades
Authorization: Bearer {jwt_token}

// Response (lista resumida - sem perguntas)
[
  {
    "id_atividade": "uuid-1",
    "aula_id": "uuid-aula",
    "titulo": "Quiz de Matemática",
    "id_tipo_atividade": "1"
  },
  {
    "id_atividade": "uuid-2", 
    "aula_id": "uuid-aula",
    "titulo": "Redação",
    "id_tipo_atividade": "2"
  }
]
```

#### 🔍 Buscar Atividade Específica

```typescript
GET /atividades/{id}
Authorization: Bearer {jwt_token}

// Response completo COM perguntas (sem gabarito para alunos)
{
  "id_atividade": "uuid",
  "aula_id": "uuid-aula",
  "titulo": "Avaliação de História",
  "id_tipo_atividade": "1",
  "perguntasMultipla": [
    {
      "id_pergunta": "uuid-pergunta-1",
      "numero_questao": 1,
      "texto_pergunta": "Em que ano foi descoberto o Brasil?",
      "respostas": [{
        "id_resposta": "uuid-resposta",
        "alternativa_a": "1498",
        "alternativa_b": "1500", 
        "alternativa_c": "1502",
        "alternativa_d": "1504",
        "alternativa_e": null
      }]
      // IMPORTANTE: gabarito não é incluído no response
    }
  ],
  "perguntasObjetiva": [
    {
      "id_pergunta": "uuid-pergunta-2",
      "texto_questao": "Descreva os impactos da colonização."
    }
  ]
}
```

#### ✏️ Atualizar Atividade

```typescript
PUT /atividades/{id}
Content-Type: application/json
Authorization: Bearer {jwt_token}

// IMPORTANTE: Só pode editar se NÃO houver respostas de alunos
// Todos os campos são opcionais (PartialType)

// Exemplo 1: Atualizar apenas título
{
  "titulo": "Novo Título da Atividade"
}

// Exemplo 2: Atualizar tipo e perguntas completamente
{
  "titulo": "Avaliação Reformulada",
  "tipo_atividade": "mista",
  "perguntas_multipla": [
    {
      "numero_questao": 1,
      "texto_pergunta": "Nova pergunta de múltipla escolha?",
      "respostas": [
        {"opcao": "A", "texto_resposta": "Resposta A"},
        {"opcao": "B", "texto_resposta": "Resposta B"}
      ],
      "resposta_correta": "A"
    }
  ],
  "perguntas_objetiva": [
    {
      "texto_questao": "Nova pergunta aberta reformulada."
    }
  ]
}

// Errors possíveis:
// 400: "Não é possível editar uma atividade que já possui respostas de alunos"
// 404: "Atividade não encontrada"
```

#### 🗑️ Deletar Atividade

```typescript
DELETE /atividades/{id}
Authorization: Bearer {jwt_token}

// Response detalhado do que foi deletado
{
  "message": "Atividade e todos os dados relacionados foram deletados com sucesso",
  "detalhes": {
    "respostasMultipla": 15,      // Respostas de alunos deletadas
    "respostasObjetiva": 8,       // Respostas abertas deletadas
    "gabaritos": 5,               // Gabaritos deletados
    "alternativas": 5,            // Alternativas deletadas
    "perguntasMultipla": 5,       // Perguntas múltipla escolha
    "perguntasObjetiva": 3        // Perguntas objetivas
  }
}

// ATENÇÃO: Deletar uma atividade remove TODAS as respostas dos alunos!
```

### 🎯 SISTEMA DE RESPOSTAS - Manual Completo

#### 1️⃣ Responder Pergunta Individual - Múltipla Escolha

```typescript
POST /atividades/responder-multipla
Content-Type: application/json
Authorization: Bearer {jwt_token} // Token do ALUNO

{
  "id_atividade": "uuid-atividade",
  "id_pergunta": "uuid-pergunta",
  "id_aluno": "uuid-aluno",
  "resposta": "B"                    // Letra da alternativa escolhida
}

// Response com feedback imediato
{
  "message": "Resposta de múltipla escolha registrada com sucesso",
  "acerto": true,                    // true/false
  "resposta": "B",                   // Resposta do aluno
  "resposta_correta": "B"            // Gabarito correto
}

// Errors possíveis:
// 400: "Aluno já respondeu esta pergunta nesta atividade"
// 404: "Gabarito não encontrado para a pergunta"
```

#### 2️⃣ Responder Pergunta Individual - Aberta

```typescript
POST /atividades/responder-aberta
Content-Type: application/json
Authorization: Bearer {jwt_token} // Token do ALUNO

{
  "id_atividade": "uuid-atividade",
  "id_pergunta": "uuid-pergunta",   // OBRIGATÓRIO
  "id_aluno": "uuid-aluno",
  "caminho_arquivo": "uploads/respostas/resposta_aluno_123.pdf"
}

// Response
{
  "message": "Resposta aberta registrada com sucesso",
  "resposta": {
    "id_resposta": "uuid-resposta",
    "id_atividade": "uuid-atividade",
    "id_pergunta": "uuid-pergunta",
    "aluno_id": "uuid-aluno",
    "caminho_arquivo": "uploads/respostas/resposta_aluno_123.pdf",
    "data_envio": "2024-01-15T10:30:00.000Z"
  }
}

// Errors possíveis:
// 400: "Aluno já respondeu esta pergunta"
```

#### 3️⃣ Responder Atividade Completa (Recomendado)

```typescript
POST /atividades/responder-completa
Content-Type: application/json
Authorization: Bearer {jwt_token} // Token do ALUNO

{
  "id_atividade": "uuid-atividade",
  "id_aluno": "uuid-aluno",
  "respostas": [
    {
      "id_pergunta": "uuid-pergunta-1",
      "resposta_multipla": "A"        // Para múltipla escolha
    },
    {
      "id_pergunta": "uuid-pergunta-2", 
      "resposta_multipla": "C"
    },
    {
      "id_pergunta": "uuid-pergunta-3",
      "resposta_aberta": "uploads/respostas/redacao_aluno.pdf" // Para aberta
    },
    {
      "id_pergunta": "uuid-pergunta-4",
      "resposta_aberta": "uploads/respostas/dissertacao_aluno.docx"
    }
  ]
}

// Response
{
  "message": "Respostas registradas com sucesso"
}

// Validações:
// - Verifica se aluno já respondeu qualquer pergunta da atividade
// - Permite misturar tipos de resposta na mesma atividade
// - Salva automaticamente com timestamp
```

### 📊 SISTEMA DE RESULTADOS E RELATÓRIOS

#### 🎯 Resultado Individual - Aluno por Atividade

```typescript
GET /atividades/{id_atividade}/resultado/{id_aluno}
Authorization: Bearer {jwt_token}

// Response detalhado
{
  "id_atividade": "uuid-atividade",
  "id_aluno": "uuid-aluno",
  "total_questoes": 5,              // Total de perguntas na atividade
  "total_respondidas": 5,           // Quantas o aluno respondeu
  "acertos": 3,                     // Acertos em múltipla escolha
  "resultado": "3/3",               // Formato "acertos/total_multipla"
  "respostas": [
    {
      "id_pergunta": "uuid-pergunta-1",
      "tipo": "multipla",
      "resposta": "A",              // Resposta do aluno
      "acerto": true,               // Se acertou
      "resposta_correta": "A"       // Gabarito
    },
    {
      "id_pergunta": "uuid-pergunta-2",
      "tipo": "multipla", 
      "resposta": "B",
      "acerto": false,
      "resposta_correta": "C"
    },
    {
      "id_pergunta": "uuid-pergunta-3",
      "tipo": "aberta",
      "resposta": "uploads/respostas/redacao.pdf" // Caminho do arquivo
    }
  ]
}

// Se aluno não respondeu ainda:
{
  "message": "O aluno ainda não respondeu esta atividade."
}
```

#### 📈 Resultados por Aula - Todas Atividades

```typescript
GET /atividades/aula/{aula_id}/aluno/{id_aluno}
Authorization: Bearer {jwt_token}

// Response: Array com todas as atividades da aula
[
  {
    "id_atividade": "uuid-atividade-1",
    "titulo": "Quiz de Matemática",
    "total_questoes": 10,
    "total_respondidas": 10,
    "acertos": 8,
    "resultado": "8/7",             // "acertos/total_multipla_escolha"
    "respostas": [
      // ... array detalhado como acima
    ]
  },
  {
    "id_atividade": "uuid-atividade-2", 
    "titulo": "Redação sobre História",
    "total_questoes": 2,
    "total_respondidas": 2,
    "acertos": 0,                   // Não há múltipla escolha
    "resultado": "0/0",
    "respostas": [
      {
        "id_pergunta": "uuid",
        "tipo": "aberta",
        "resposta": "uploads/respostas/historia.pdf"
      }
    ]
  }
]
```

### 🔄 Cenários Específicos de Uso - Atividades

#### Cenário 1: Administrador Criando Avaliação Completa

```typescript
// 1. Criar aula primeiro (se não existir)
const aula = await fetch('/aulas', {
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${adminToken}`
  },
  body: formData // com titulo, descricao, file
});

// 2. Criar atividade mista para a aula
const atividade = await fetch('/atividades', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    aula_id: aula.id,
    titulo: "Avaliação Final - Módulo 1",
    tipo_atividade: "mista",
    perguntas_multipla: [
      {
        numero_questao: 1,
        texto_pergunta: "Qual a principal função do GitHub?",
        respostas: [
          {opcao: "A", texto_resposta: "Versionamento de código"},
          {opcao: "B", texto_resposta: "Edição de texto"},
          {opcao: "C", texto_resposta: "Navegação web"},
          {opcao: "D", texto_resposta: "Edição de imagens"}
        ],
        resposta_correta: "A"
      },
      {
        numero_questao: 2,
        texto_pergunta: "Git e GitHub são a mesma coisa?",
        respostas: [
          {opcao: "A", texto_resposta: "Sim, são idênticos"},
          {opcao: "B", texto_resposta: "Não, Git é local e GitHub é remoto"},
          {opcao: "C", texto_resposta: "GitHub é uma versão antiga do Git"}
        ],
        resposta_correta: "B"
      }
    ],
    perguntas_objetiva: [
      {
        texto_questao: "Explique com suas palavras a diferença entre Git e GitHub, e cite um exemplo prático de uso."
      },
      {
        texto_questao: "Descreva o fluxo de trabalho básico com Git: add, commit, push."
      }
    ]
  })
});

// 3. Agendar atividade para turma
await fetch('/turma_aula', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    turma_id: "uuid-turma",
    aula_id: aula.id,
    data_aula: "2024-02-15",
    horario_inicio: "14:00:00", 
    horario_fim: "16:00:00"
  })
});
```

#### Cenário 2: Aluno Fazendo Atividade Completa

```typescript
// 1. Aluno acessa aula com senha temporária (já validada)
// 2. Listar atividades da aula
const atividades = await fetch(`/atividades?aula_id=${aulaId}`, {
  headers: { Authorization: `Bearer ${alunoToken}` }
});

// 3. Buscar detalhes da atividade específica
const atividadeDetalhes = await fetch(`/atividades/${atividadeId}`, {
  headers: { Authorization: `Bearer ${alunoToken}` }
});

// 4. Preparar respostas (interface do frontend coleta as respostas)
const respostasAluno = [
  {
    id_pergunta: "uuid-pergunta-1",
    resposta_multipla: "A"  // Aluno escolheu A
  },
  {
    id_pergunta: "uuid-pergunta-2", 
    resposta_multipla: "B"  // Aluno escolheu B
  },
  {
    id_pergunta: "uuid-pergunta-3",
    resposta_aberta: "uploads/respostas/explicacao_git_github.pdf" // Upload feito anteriormente
  },
  {
    id_pergunta: "uuid-pergunta-4",
    resposta_aberta: "uploads/respostas/fluxo_git.docx"
  }
];

// 5. Enviar todas as respostas de uma vez
const resultado = await fetch('/atividades/responder-completa', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${alunoToken}`
  },
  body: JSON.stringify({
    id_atividade: atividadeId,
    id_aluno: alunoId,
    respostas: respostasAluno
  })
});

// 6. Ver resultado imediato (múltipla escolha)
const meuResultado = await fetch(`/atividades/${atividadeId}/resultado/${alunoId}`, {
  headers: { Authorization: `Bearer ${alunoToken}` }
});
```

#### Cenário 3: Professor/Administrador Acompanhando Resultados

```typescript
// 1. Ver todas as atividades de uma aula
const atividades = await fetch(`/atividades?aula_id=${aulaId}`, {
  headers: { Authorization: `Bearer ${adminToken}` }
});

// 2. Para cada atividade, ver resultados de todos os alunos
const resultadosGerais = await Promise.all(
  atividades.map(async (atividade) => {
    // Buscar todos os alunos da turma
    const alunos = await fetch(`/alunos?turma_id=${turmaId}`);
    
    // Para cada aluno, buscar resultado na atividade
    const resultadosAlunos = await Promise.all(
      alunos.map(async (aluno) => {
        try {
          const resultado = await fetch(
            `/atividades/${atividade.id_atividade}/resultado/${aluno.id}`,
            { headers: { Authorization: `Bearer ${adminToken}` } }
          );
          return { aluno: aluno.nome, ...resultado };
        } catch (error) {
          return { 
            aluno: aluno.nome, 
            message: "Não respondeu ainda" 
          };
        }
      })
    );
    
    return {
      atividade: atividade.titulo,
      resultados: resultadosAlunos
    };
  })
);

// 3. Gerar relatório estatístico
const estatisticas = resultadosGerais.map(atividade => {
  const responderam = atividade.resultados.filter(r => !r.message).length;
  const totalAlunos = atividade.resultados.length;
  const mediaAcertos = atividade.resultados
    .filter(r => r.acertos !== undefined)
    .reduce((acc, r) => acc + r.acertos, 0) / responderam || 0;
  
  return {
    atividade: atividade.atividade,
    participacao: `${responderam}/${totalAlunos}`,
    mediaAcertos: mediaAcertos.toFixed(1)
  };
});
```

#### Cenário 4: Sistema de Upload para Questões Abertas

```typescript
// Interface de upload para questões abertas
interface UploadQuestaoAberta {
  perguntaId: string;
  alunoId: string;
  
  // Configurações de upload
  uploadConfig: {
    maxSize: 10 * 1024 * 1024; // 10MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
  };
}

// 1. Upload do arquivo primeiro
const uploadArquivo = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/uploads/respostas', {
    method: 'POST',
    headers: { Authorization: `Bearer ${alunoToken}` },
    body: formData
  });
  
  return response.json(); // { caminho: "uploads/respostas/arquivo.pdf" }
};

// 2. Depois salvar a resposta referenciando o arquivo
const salvarResposta = async (perguntaId: string, caminhoArquivo: string) => {
  return fetch('/atividades/responder-aberta', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${alunoToken}`
    },
    body: JSON.stringify({
      id_atividade: atividadeId,
      id_pergunta: perguntaId,
      id_aluno: alunoId,
      caminho_arquivo: caminhoArquivo
    })
  });
};
```

### 🛡️ Regras de Negócio - Atividades

#### Tipos de Atividade
```typescript
interface TiposAtividade {
  multipla: {
    id_tipo: "1";
    descricao: "Apenas questões de múltipla escolha";
    feedback: "Imediato com gabarito";
    correção: "Automática";
  };
  objetiva: {
    id_tipo: "2"; 
    descricao: "Apenas questões abertas/dissertativas";
    feedback: "Sem correção automática";
    correção: "Manual pelo professor";
  };
  mista: {
    id_tipo: "1"; // Usa ID da múltipla como padrão
    descricao: "Múltipla escolha + questões abertas";
    feedback: "Parcial (só múltipla escolha)";
    correção: "Híbrida";
  };
}
```

#### Limitações e Validações
```typescript
interface RegraAtividades {
  tentativas: {
    limit: 1; // Uma tentativa por aluno por atividade
    verificacao: "Por id_pergunta + aluno_id";
  };
  
  edicao: {
    permitida: boolean; // Só se não houver respostas
    verificacao: "Conta respostas nas tabelas relacionadas";
  };
  
  multipla_escolha: {
    opcoes: ['A', 'B', 'C', 'D', 'E'];
    minimo_opcoes: 2;
    maximo_opcoes: 5;
    gabarito_obrigatorio: true;
  };
  
  questoes_abertas: {
    arquivo_obrigatorio: true;
    tipos_permitidos: ['pdf', 'doc', 'docx', 'txt'];
    tamanho_maximo: '10MB';
  };
  
  sequencia_questoes: {
    multipla_escolha: "Numeração obrigatória e sequencial";
    objetiva: "Sem numeração específica";
  };
}
```

#### Estados de Atividade
```typescript
interface StatusAtividade {
  criada: {
    tem_perguntas: boolean;
    pode_editar: true;
    pode_deletar: true;
  };
  
  com_respostas: {
    tem_respostas_alunos: boolean;
    pode_editar: false;
    pode_deletar: true; // Mas deleta todas as respostas
  };
  
  finalizada: {
    todos_alunos_responderam: boolean;
    pode_gerar_relatorio: true;
    pode_exportar_dados: true;
  };
}
```

### 📱 Componentes Frontend Sugeridos - Atividades

#### Editor de Atividade (Administrador)
```typescript
interface AtividadeEditor {
  mode: 'create' | 'edit';
  atividade?: Atividade;
  
  basicInfo: {
    titulo: string;
    tipo: 'multipla' | 'objetiva' | 'mista';
    aula_id: string;
  };
  
  perguntasMultipla: Array<{
    numero_questao: number;
    texto_pergunta: string;
    alternativas: Array<{
      opcao: 'A' | 'B' | 'C' | 'D' | 'E';
      texto: string;
    }>;
    gabarito: 'A' | 'B' | 'C' | 'D' | 'E';
  }>;
  
  perguntasObjetiva: Array<{
    texto_questao: string;
    instrucoes_resposta?: string;
  }>;
  
  actions: {
    addMultipla: () => void;
    removeMultipla: (index: number) => void;
    addObjetiva: () => void;
    removeObjetiva: (index: number) => void;
    save: () => Promise<void>;
    preview: () => void;
  };
}
```

#### Interface de Resposta (Aluno)
```typescript
interface AtividadeInterface {
  atividade: Atividade;
  aluno_id: string;
  
  state: {
    respostas: Map<string, string>; // pergunta_id -> resposta
    uploads: Map<string, File>;     // pergunta_id -> arquivo
    completed: boolean;
    timeSpent: number; // em segundos
  };
  
  multipla: {
    renderPergunta: (pergunta: PerguntaMultipla) => JSX.Element;
    selectOpcao: (perguntaId: string, opcao: string) => void;
    getSelected: (perguntaId: string) => string | null;
  };
  
  objetiva: {
    renderPergunta: (pergunta: PerguntaObjetiva) => JSX.Element;
    uploadFile: (perguntaId: string, file: File) => Promise<string>;
    removeFile: (perguntaId: string) => void;
  };
  
  actions: {
    saveProgress: () => void; // Salvar parcial (se implementado)
    submitAll: () => Promise<void>;
    getResult: () => Promise<Resultado>;
  };
}
```

#### Dashboard de Resultados (Professor)
```typescript
interface ResultadosDashboard {
  atividade: Atividade;
  
  statistics: {
    totalAlunos: number;
    responderam: number;
    participacao: string; // "15/20"
    mediaAcertos: number;
    questaoMaisDificil: {
      pergunta: string;
      percentualAcerto: number;
    };
  };
  
  resultadosDetalhados: Array<{
    aluno: {
      id: string;
      nome: string;
    };
    resultado: {
      acertos: number;
      total: number;
      percentual: number;
      tempo_gasto?: number;
      respostas_abertas: number;
    };
    status: 'concluido' | 'pendente' | 'parcial';
  }>;
  
  actions: {
    exportarCSV: () => void;
    exportarPDF: () => void;
    reenviarParaAluno: (alunoId: string) => void;
    corrigirAberta: (perguntaId: string, alunoId: string) => void;
  };
}
```

Esta documentação fornece um guia completo para implementar todas as funcionalidades relacionadas às atividades no frontend, cobrindo criação, edição, resposta, correção e relatórios com exemplos práticos de uso.
