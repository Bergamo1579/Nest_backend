import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('acessos_temporarios')
export class AcessosTemporarios {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ type: 'char', length: 36 })
  aluno_id: string;

  @Column({ type: 'char', length: 36 })
  aula_id: string;

  @Column({ type: 'char', length: 36 })
  instrutor_id: string;

  @Column({ type: 'varchar', length: 255 })
  temp_password: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  criado_em: Date;
}