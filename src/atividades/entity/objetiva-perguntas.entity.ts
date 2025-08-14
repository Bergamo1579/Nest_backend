import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Atividades } from './atividades.entity';

@Entity('objetiva_perguntas')
export class ObjetivaPerguntas {
  @PrimaryColumn({ type: 'char', length: 36 })
  id_pergunta: string;

  @Column({ type: 'char', length: 36 })
  id_atividade: string;

  @Column({ type: 'text' })
  texto_questao: string;

  @ManyToOne(() => Atividades, atividade => atividade.perguntasObjetiva)
  @JoinColumn({ name: 'id_atividade' })
  atividade: Atividades;

  constructor(partial: Partial<ObjetivaPerguntas>) {
    Object.assign(this, partial);
  }
}