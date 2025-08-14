import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { MultiplaEscolhaPerguntas } from './multipla-escolha-perguntas.entity';
import { ObjetivaPerguntas } from './objetiva-perguntas.entity';

@Entity('atividades')
export class Atividades {
  @PrimaryColumn({ type: 'char', length: 36 })
  id_atividade: string;

  @Column({ type: 'char', length: 36 })
  aula_id: string;

  @Column({ type: 'varchar', length: 255 })
  titulo: string;

  @Column({ type: 'char', length: 36 })
  id_tipo_atividade: string;

  @OneToMany(() => MultiplaEscolhaPerguntas, pergunta => pergunta.atividade)
  perguntasMultipla: MultiplaEscolhaPerguntas[];

  @OneToMany(() => ObjetivaPerguntas, pergunta => pergunta.atividade)
  perguntasObjetiva: ObjetivaPerguntas[];
}