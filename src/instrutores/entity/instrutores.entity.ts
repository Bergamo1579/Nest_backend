import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('instrutores')
export class Instrutor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  nome: string;

  @Column({ length: 100, nullable: true })
  description?: string;

  @Column({ type: 'char', length: 36 })
  id_unidade: string;
}