import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Atividades } from './atividades.entity';
import { ObjetivaPerguntas } from './objetiva-perguntas.entity';

@Entity('objetiva_respostas')
export class ObjetivaRespostas {
  @PrimaryColumn({ type: 'char', length: 36 })
  id_resposta: string;

  @Column({ type: 'char', length: 36 })
  id_atividade: string;

  @Column({ type: 'char', length: 36, nullable: true })
  id_pergunta: string;

  @Column({ type: 'char', length: 36 })
  aluno_id: string;

  @Column({ type: 'varchar', length: 255 })
  caminho_arquivo: string;

  @Column({ type: 'datetime' })
  data_envio: Date;

  @ManyToOne(() => Atividades)
  @JoinColumn({ name: 'id_atividade' })
  atividade: Atividades;

  @ManyToOne(() => ObjetivaPerguntas)
  @JoinColumn({ name: 'id_pergunta' })
  pergunta: ObjetivaPerguntas;

  constructor(partial: Partial<ObjetivaRespostas>) {
    Object.assign(this, partial);
  }
}