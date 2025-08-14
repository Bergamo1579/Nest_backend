import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from './role.entity';

@Entity('users')
export class Auth {
  @PrimaryColumn({ type: 'char', length: 36 })
  uuid: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, unique: true })
  username: string;

  @Column({ length: 255 })
  password_hash: string;

  @Column({ type: 'int', unsigned: true })
  role_id: number;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  constructor(partial: Partial<Auth>) {
    Object.assign(this, partial);
  }
}