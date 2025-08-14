import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { MultiplaEscolhaPerguntas } from './multipla-escolha-perguntas.entity';

@Entity('multipla_escolha_gabarito')
export class MultiplaEscolhaGabarito {
  @PrimaryColumn({ type: 'char', length: 36 })
  id_gabarito: string;

  @Column({ type: 'char', length: 36 })
  id_pergunta: string;

  @Column({ type: 'varchar', length: 1 })
  resposta_correta: string;

  @ManyToOne(() => MultiplaEscolhaPerguntas, pergunta => pergunta.gabarito)
  @JoinColumn({ name: 'id_pergunta' })
  pergunta: MultiplaEscolhaPerguntas;

  constructor(partial: Partial<MultiplaEscolhaGabarito>) {
    Object.assign(this, partial);
  }
}