import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('respostas_alunos_multipla')
export class RespostasAlunosMultipla {
  @PrimaryColumn({ type: 'char', length: 36 })
  id_resposta: string;

  @Column({ type: 'char', length: 36 })
  id_pergunta: string;

  @Column({ type: 'char', length: 36 })
  id_atividade: string; // <-- ADICIONE ESTA LINHA

  @Column({ type: 'char', length: 36 })
  aluno_id: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  acerto: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resposta_aluno: string;

  @Column({ type: 'datetime' })
  data_feitura: Date;

  constructor(partial: Partial<RespostasAlunosMultipla>) {
    Object.assign(this, partial);
  }
}