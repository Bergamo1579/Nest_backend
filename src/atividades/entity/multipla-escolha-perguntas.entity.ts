import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Atividades } from './atividades.entity';
import { MultiplaEscolhaRespostas } from './multipla-escolha-respostas.entity';
import { MultiplaEscolhaGabarito } from './multipla-escolha-gabarito.entity';

@Entity('multipla_escolha_perguntas')
export class MultiplaEscolhaPerguntas {
  @PrimaryColumn({ type: 'char', length: 36 })
  id_pergunta: string;

  @Column({ type: 'char', length: 36 })
  id_atividade: string;

  @Column({ type: 'int' })
  numero_questao: number;

  @Column({ type: 'text' })
  texto_pergunta: string;

  @ManyToOne(() => Atividades, atividade => atividade.perguntasMultipla)
  @JoinColumn({ name: 'id_atividade' })
  atividade: Atividades;

  @OneToMany(() => MultiplaEscolhaRespostas, resposta => resposta.pergunta)
  respostas: MultiplaEscolhaRespostas[];

  @OneToMany(() => MultiplaEscolhaGabarito, gabarito => gabarito.pergunta)
  gabarito: MultiplaEscolhaGabarito[];

  constructor(partial: Partial<MultiplaEscolhaPerguntas>) {
    Object.assign(this, partial);
  }
}