import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('alunos')
export class Aluno {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  nome: string;

  @Column({ length: 14, unique: true })
  cpf: string;

  @Column({ type: 'date' })
  data_nascimento: Date;

  @Column({ type: 'char', length: 36, nullable: true })
  unidade_id?: string;

  @Column({ type: 'char', length: 36, nullable: true })
  turma_id?: string;

  @Column({ type: 'char', length: 36 })
  empresa_id: string;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  criado_em: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  atualizado_em: Date;

  @Column({ length: 100, nullable: true })
  responsavel_nome?: string;

  @Column({ type: 'enum', enum: ['M', 'F'], nullable: true })
  sexo?: 'M' | 'F';

  @Column({ length: 20, nullable: true })
  rg?: string;

  @Column({ length: 255, nullable: true })
  endereco?: string;

  @Column({ length: 10, nullable: true })
  numero?: string;

  @Column({ length: 100, nullable: true })
  complemento?: string;

  @Column({ length: 100, nullable: true })
  bairro?: string;

  @Column({ length: 100, nullable: true })
  cidade?: string;

  @Column({ length: 9, nullable: true })
  cep?: string;

  @Column({ length: 20, nullable: true })
  celular?: string;

  @Column({ length: 20, nullable: true })
  celular_recado?: string;

  @Column({ length: 100, nullable: true })
  email?: string;

  @Column({ length: 150, nullable: true })
  escola?: string;

  @Column({ length: 50, nullable: true })
  serie?: string;

  @Column({ type: 'enum', enum: ['manha', 'tarde', 'noite'], nullable: true })
  periodo?: 'manha' | 'tarde' | 'noite';
}