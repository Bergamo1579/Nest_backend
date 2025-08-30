import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('presence')
export class AlunoAulaPresence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'char', length: 36 })
  aluno_id: string;

  @Column({ type: 'char', length: 36 })
  aula_id: string;

  @Column({ type: 'text', nullable: true })
  justify: string;

  @CreateDateColumn({ type: 'timestamp' })
  criado_em: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  atualizado_em: Date;
}