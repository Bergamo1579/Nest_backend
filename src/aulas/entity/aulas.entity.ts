import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('aulas')
export class Aula {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  titulo: string;

  @Column()
  descricao: string;

  @Column({ nullable: true })
  icon_src: string;

  @CreateDateColumn()
  criado_em: Date;
}