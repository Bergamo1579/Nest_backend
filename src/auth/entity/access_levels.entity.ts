import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('access_levels')
export class AccessLevel {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;
}