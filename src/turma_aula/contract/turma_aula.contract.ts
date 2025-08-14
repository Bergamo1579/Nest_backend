export interface ITurmaAula {
  id: string;
  turma_id: string;
  aula_id: string;
  data_aula: string;
  horario_inicio: string;
  horario_fim?: string;
  unidade_id: string;
}