# PROMPT PARA CRIAÇÃO DE FRONTEND - SISTEMA DE MENOR APRENDIZ

Crie um frontend React/Next.js completo para um sistema de gerenciamento educacional de menor aprendiz com as seguintes especificações:

## ESTRUTURA DO SISTEMA
- 4 perfis de usuário com interfaces distintas: Administrador, Empresa, Instrutor, Aluno
- Autenticação JWT + sistema de senha temporária para alunos
- Design responsivo e moderno (use Tailwind CSS)

## PÁGINAS POR PERFIL:

### 🔐 AUTENTICAÇÃO
- Página de login única com redirecionamento baseado no role
- Componente de validação de senha temporária para alunos

### 👨‍💼 ADMINISTRADOR (Dashboard Completo)
- **Dashboard**: Visão geral com estatísticas
- **Unidades**: CRUD completo com tabela listagem
- **Empresas**: CRUD completo
- **Turmas**: CRUD completo  
- **Instrutores**: CRUD completo
- **Alunos**: CRUD com filtros avançados (unidade, turma, empresa)
- **Aulas**: 
  - Lista de aulas
  - Editor estilo Moodle para criar/editar aulas
  - Gerenciador de conteúdo (texto, imagem, vídeo, arquivo)
  - Sistema de drag-and-drop para reordenar conteúdos
  - Criador de atividades (múltipla escolha + questões abertas)
- **Agendamentos**: Calendário para agendar aulas por turma
- **Relatórios**: Dashboard com gráficos de desempenho

### 🏢 EMPRESA (Dashboard Simples)
- **Dashboard**: Lista dos alunos da empresa
- **Relatórios de Presença**: Tabela com presença por aluno/aula
- **Performance**: Gráficos de aproveitamento dos alunos

### 👨‍🏫 INSTRUTOR (Interface de Liberação)
- **Dashboard**: Aulas ativas no momento atual
- **Liberação de Acesso**: 
  - Lista de alunos da unidade
  - Gerador de senha temporária
  - Status de acessos criados
- **Acompanhamento**: Visualização de quem está fazendo as aulas

### 🎓 ALUNO (Interface de Aprendizagem)
- **Minhas Aulas**: Lista de aulas disponíveis no horário atual
- **Acesso à Aula**: Campo para inserir senha temporária
- **Visualizador de Conteúdo**: 
  - Player de vídeo embarcado
  - Visualizador de PDF
  - Leitor de texto formatado
  - Galeria de imagens
- **Atividades**:
  - Interface para questões múltipla escolha
  - Upload de arquivos para questões abertas
  - Feedback imediato de acertos
- **Meus Resultados**: Dashboard com performance

## COMPONENTES ESPECÍFICOS NECESSÁRIOS:

### Editor de Aula (Administrador)
- Rich text editor para textos
- Upload de imagens com preview
- Campo para links de vídeo (YouTube/Vimeo) com preview
- Upload de arquivos PDF/Word/PowerPoint
- Lista ordenável de conteúdos (drag-and-drop)
- Criador de atividades com:
  - Múltipla escolha (A,B,C,D,E)
  - Questões abertas
  - Definição de gabarito

### Visualizador de Aula (Aluno)
- Player responsivo para vídeos
- Leitor de PDF embarcado
- Carrossel de imagens
- Interface limpa para leitura de texto
- Progresso de conclusão da aula

### Sistema de Atividades
- Quiz interativo para múltipla escolha
- Zona de upload para questões abertas
- Feedback visual de respostas corretas/incorretas
- Progress bar do progresso das atividades

## FUNCIONALIDADES TÉCNICAS:

### Estado Global (use Zustand ou Context)
- Gerenciamento de autenticação
- Cache de dados do usuário
- Estado das aulas em andamento

### Uploads
- Drag-and-drop para arquivos
- Preview de imagens antes do upload
- Barra de progresso de upload
- Validação de tipos e tamanhos de arquivo

### Tempo Real (opcional)
- Notificações quando instrutor libera acesso
- Status online de alunos fazendo aulas

### Responsividade
- Design mobile-first
- Layouts diferentes para desktop/tablet/mobile
- Menu hamburger para dispositivos móveis

## APIS A INTEGRAR:
Use os endpoints documentados acima, implementando:
- Interceptadores de requisição para JWT
- Tratamento de erros com toast notifications
- Loading states para todas as operações
- Retry automático para falhas de rede

### POST /auth/login
Content-Type: application/json

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

### GET /unidades
GET    /unidades                    # Listar unidades
POST   /unidades                    # Criar unidade
PUT    /unidades/:id                # Atualizar unidade
DELETE /unidades/:id                # Deletar unidade
GET    /unidades/:id                # Buscar unidade específica

### GET /empresas
GET    /empresas                    # Listar empresas
POST   /empresas                    # Criar empresa
PUT    /empresas/:id                # Atualizar empresa
DELETE /empresas/:id                # Deletar empresa
GET    /empresas/:id                # Buscar empresa específica

## DESIGN SYSTEM:
- Paleta de cores educacional (azuis, verdes)
- Tipografia clara e legível
- Ícones intuitivos (use Heroicons ou Lucide)
- Feedback visual consistente
- Animações suaves para transições

## Gerenciamento de Alunos

GET    /alunos                      # Listar alunos (com filtros)
POST   /alunos                      # Criar aluno
PUT    /alunos/:id                  # Atualizar aluno
DELETE /alunos/:id                  # Deletar aluno
GET    /alunos/:id                  # Buscar aluno específico

# Filtros disponíveis:
# ?unidade_id=uuid
# ?turma_id=uuid
# ?empresa_id=uuid
# ?nome=string
# ?cpf=string


## Gerenciamento de Alunos
GET    /instrutores                 # Listar instrutores
POST   /instrutores                 # Criar instrutor
PUT    /instrutores/:id             # Atualizar instrutor
DELETE /instrutores/:id             # Deletar instrutor
GET    /instrutores/:id             # Buscar instrutor específico

## Gerenciamento de Instrutores
GET    /instrutores                 # Listar instrutores
POST   /instrutores                 # Criar instrutor
PUT    /instrutores/:id             # Atualizar instrutor
DELETE /instrutores/:id             # Deletar instrutor
GET    /instrutores/:id             # Buscar instrutor específico

## Gerenciamento de Aulas (Estilo Moodle)