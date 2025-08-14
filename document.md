# Documentação do Projeto

## Introdução
Este projeto é uma API desenvolvida com NestJS para gerenciar aulas, turmas, alunos e agendamentos. Ele utiliza TypeORM para interação com o banco de dados e Swagger para documentação dos endpoints.

---

## Endpoints

### Módulo: Aulas

#### Endpoint: Lista todas as aulas
- Método: GET
- Rota: /aulas
- Descrição: Lista todas as aulas cadastradas.
- Query Params:
  - `query` (opcional): Parâmetros de busca para filtrar as aulas.
- Retorno: Lista de aulas (tipo: `Aula[]`).

#### Endpoint: Cria uma nova aula
- Método: POST
- Rota: /aulas
- Descrição: Cria uma nova aula com os dados fornecidos e um arquivo de imagem.
- Consome: multipart/form-data
- Body:
  - `titulo` (string, obrigatório): Título da aula.
  - `descricao` (string, obrigatório): Descrição da aula.
  - `file` (arquivo, obrigatório): Arquivo de imagem para a aula.
- Retorno: Aula criada (tipo: `Aula`).

#### Endpoint: Atualiza uma aula existente
- Método: PUT
- Rota: /aulas/:id
- Descrição: Atualiza os dados de uma aula existente.
- Path Params:
  - `id` (string, obrigatório): ID da aula a ser atualizada.
- Body:
  - Dados da aula a serem atualizados.
- Retorno: Aula atualizada (tipo: `Aula`).

#### Endpoint: Deleta uma aula
- Método: DELETE
- Rota: /aulas/:id
- Descrição: Remove uma aula do sistema.
- Path Params:
  - `id` (string, obrigatório): ID da aula a ser deletada.
- Retorno: Nenhum conteúdo (status 200).

---

### Módulo: TurmaAula

#### Endpoint: Cria um novo agendamento de turma/aula
- Método: POST
- Rota: /turma_aula
- Descrição: Cria um novo agendamento de turma/aula.
- Body:
  - `turma_id` (string, obrigatório): ID da turma.
  - `aula_id` (string, obrigatório): ID da aula.
  - `data_aula` (string, obrigatório): Data do agendamento (formato YYYY-MM-DD).
  - `horario_inicio` (string, obrigatório): Horário de início (formato HH:mm:ss).
  - `horario_fim` (string, opcional): Horário de término (formato HH:mm:ss).
- Retorno: Agendamento criado (tipo: `TurmaAula`).

#### Endpoint: Edita data e horário do agendamento
- Método: PUT
- Rota: /turma_aula/:id/data-horario
- Descrição: Atualiza a data e horário de um agendamento existente.
- Path Params:
  - `id` (string, obrigatório): ID do agendamento.
- Body:
  - `data_aula` (string, opcional): Nova data do agendamento.
  - `horario_inicio` (string, opcional): Novo horário de início.
  - `horario_fim` (string, opcional): Novo horário de término.
- Retorno: Agendamento atualizado (tipo: `TurmaAula`).

#### Endpoint: Exclui um agendamento
- Método: DELETE
- Rota: /turma_aula/:id
- Descrição: Remove um agendamento do sistema.
- Path Params:
  - `id` (string, obrigatório): ID do agendamento.
- Retorno: Nenhum conteúdo (status 200).

#### Endpoint: Lista todos os agendamentos ou filtra por query
- Método: GET
- Rota: /turma_aula
- Descrição: Lista todos os agendamentos ou filtra por query.
- Query Params:
  - Parâmetros de busca para filtrar os agendamentos.
- Retorno: Lista de agendamentos (tipo: `TurmaAula[]`).

#### Endpoint: Lista agendamentos por turma
- Método: GET
- Rota: /turma_aula/turma/:turma_id
- Descrição: Lista agendamentos de uma turma específica.
- Path Params:
  - `turma_id` (string, obrigatório): ID da turma.
- Retorno: Lista de agendamentos (tipo: `TurmaAula[]`).

#### Endpoint: Lista agendamentos por unidade
- Método: GET
- Rota: /turma_aula/unidade/:unidade_id
- Descrição: Lista agendamentos de uma unidade específica.
- Path Params:
  - `unidade_id` (string, obrigatório): ID da unidade.
- Retorno: Lista de agendamentos (tipo: `TurmaAula[]`).

#### Endpoint: Lista agendamentos por dia
- Método: GET
- Rota: /turma_aula/dia/:data_aula
- Descrição: Lista agendamentos de um dia específico.
- Path Params:
  - `data_aula` (string, obrigatório): Data do agendamento (formato YYYY-MM-DD).
- Retorno: Lista de agendamentos (tipo: `TurmaAula[]`).

#### Endpoint: Lista agendamentos ativos no momento
- Método: GET
- Rota: /turma_aula/ativos
- Descrição: Lista agendamentos ativos no momento.
- Retorno: Lista de agendamentos ativos (tipo: `TurmaAula[]`).

#### Endpoint: Lista agendamentos ativos no momento por turma
- Método: GET
- Rota: /turma_aula/ativos/turma/:turma_id
- Descrição: Lista agendamentos ativos no momento para uma turma específica.
- Path Params:
  - `turma_id` (string, obrigatório): ID da turma.
- Retorno: Lista de agendamentos ativos (tipo: `TurmaAula[]`).

#### Endpoint: Lista agendamentos ativos no momento por aluno
- Método: GET
- Rota: /turma_aula/ativos/aluno/:aluno_id
- Descrição: Lista agendamentos ativos no momento para um aluno específico.
- Path Params:
  - `aluno_id` (string, obrigatório): ID do aluno.
- Retorno: Lista de agendamentos ativos (tipo: `TurmaAula[]`).

#### Endpoint: Lista agendamentos ativos no momento por instrutor e unidade
- Método: GET
- Rota: /turma_aula/ativos/instrutor/:instrutor_id/unidade/:unidade_id
- Descrição: Lista agendamentos ativos no momento para um instrutor em uma unidade específica.
- Path Params:
  - `instrutor_id` (string, obrigatório): ID do instrutor.
  - `unidade_id` (string, obrigatório): ID da unidade.
- Retorno: Lista de agendamentos ativos (tipo: `TurmaAula[]`).

---

## Detalhes do Código

### Módulo: Aulas

#### Serviço: AulasService
- Local: `src/aulas/aulas.service.ts`
- Descrição: Contém a lógica de negócios para gerenciar aulas.
- Métodos principais:
  - `findAll`: Retorna todas as aulas cadastradas.
  - `create`: Cria uma nova aula.
  - `update`: Atualiza os dados de uma aula existente.
  - `delete`: Remove uma aula do sistema.

#### Controlador: AulasController
- Local: `src/aulas/aulas.controller.ts`
- Descrição: Define os endpoints para gerenciar aulas.
- Endpoints:
  - `GET /aulas`: Lista todas as aulas.
  - `POST /aulas`: Cria uma nova aula.
  - `PUT /aulas/:id`: Atualiza uma aula existente.
  - `DELETE /aulas/:id`: Remove uma aula.

#### Entidade: Aula
- Local: `src/aulas/entity/aulas.entity.ts`
- Descrição: Representa a tabela de aulas no banco de dados.
- Campos principais:
  - `id` (string): Identificador único da aula.
  - `titulo` (string): Título da aula.
  - `descricao` (string): Descrição da aula.
  - `icon_src` (string): Caminho do arquivo de imagem.

---

### Módulo: TurmaAula

#### Serviço: TurmaAulaService
- Local: `src/turma_aula/turma_aula.service.ts`
- Descrição: Contém a lógica de negócios para gerenciar agendamentos de turmas e aulas.
- Métodos principais:
  - `findAll`: Retorna todos os agendamentos.
  - `create`: Cria um novo agendamento.
  - `findAtivosAgora`: Lista agendamentos ativos no momento.

#### Controlador: TurmaAulaController
- Local: `src/turma_aula/turma_aula.controller.ts`
- Descrição: Define os endpoints para gerenciar agendamentos de turmas e aulas.
- Endpoints:
  - `POST /turma_aula`: Cria um novo agendamento.
  - `GET /turma_aula/ativos`: Lista agendamentos ativos no momento.

#### Entidade: TurmaAula
- Local: `src/turma_aula/entity/turma_aula.entity.ts`
- Descrição: Representa a tabela de agendamentos no banco de dados.
- Campos principais:
  - `id` (string): Identificador único do agendamento.
  - `turma_id` (string): ID da turma.
  - `aula_id` (string): ID da aula.
  - `data_aula` (string): Data do agendamento.
  - `horario_inicio` (string): Horário de início.
  - `horario_fim` (string): Horário de término.

---

## Observações
- Todos os endpoints estão protegidos por autenticação JWT.
- Os níveis de permissão são gerenciados pelo `AdmPermissionGuard`.
- A documentação Swagger está disponível em `/api`.

---

### **Como Salvar**
1. Copie o conteúdo acima.
2. Salve em um arquivo chamado `project-documentation.txt` na raiz do seu projeto.

Se precisar de mais detalhes ou ajustes, é só pedir!