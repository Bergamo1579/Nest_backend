import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('turmas')
export class Turma {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ length: 100 })
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  criado_em: Date;

  @Column({ type: 'char', length: 36, nullable: true })
  id_unidade?: string;

  constructor(partial: Partial<Turma>) {
    Object.assign(this, partial);
  }
}