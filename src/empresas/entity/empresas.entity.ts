import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('empresas')
export class Empresa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  nome: string;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  criado_em: Date;

  @Column({ length: 150 })
  razao_social: string;

  @Column({ length: 18 })
  cnpj: string;

  @Column({ length: 50, nullable: true })
  inscricao_estadual?: string;

  @Column({ length: 255, nullable: true })
  endereco?: string;

  @Column({ length: 10, nullable: true })
  numero?: string;

  @Column({ length: 100, nullable: true })
  cidade?: string;

  @Column({ length: 100, nullable: true })
  bairro?: string;

  @Column({ type: 'char', length: 2, nullable: true })
  estado?: string;

  @Column({ length: 10, nullable: true })
  cep?: string;

  @Column({ length: 20, nullable: true })
  telefone?: string;

  @Column({ length: 150, nullable: true })
  email?: string;

  @Column({ length: 150, nullable: true })
  representante_nome?: string;

  @Column({ length: 100, nullable: true })
  representante_cargo?: string;
}