import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { MultiplaEscolhaPerguntas } from './multipla-escolha-perguntas.entity';

@Entity('multipla_escolha_respostas')
export class MultiplaEscolhaRespostas {
  @PrimaryColumn({ type: 'char', length: 36 })
  id_resposta: string;

  @Column({ type: 'char', length: 36 })
  id_pergunta: string;

  @Column({ type: 'text', nullable: true })
  alternativa_a: string;

  @Column({ type: 'text', nullable: true })
  alternativa_b: string;

  @Column({ type: 'text', nullable: true })
  alternativa_c: string;

  @Column({ type: 'text', nullable: true })
  alternativa_d: string;

  @Column({ type: 'text', nullable: true })
  alternativa_e: string;

  @ManyToOne(() => MultiplaEscolhaPerguntas, pergunta => pergunta.respostas)
  @JoinColumn({ name: 'id_pergunta' })
  pergunta: MultiplaEscolhaPerguntas;

  constructor(partial: Partial<MultiplaEscolhaRespostas>) {
    Object.assign(this, partial);
  }
}