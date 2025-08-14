import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('turma_aula')
export class TurmaAula {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ type: 'char', length: 36 })
  turma_id: string;

  @Column({ type: 'char', length: 36 })
  aula_id: string;

  @Column({ type: 'date' })
  data_aula: string;

  @Column({ type: 'time' })
  horario_inicio: string;

  @Column({ type: 'time', nullable: true })
  horario_fim?: string;

  @Column({ type: 'char', length: 36 })
  unidade_id: string;

  constructor(partial: Partial<TurmaAula>) {
    Object.assign(this, partial);
  }
}