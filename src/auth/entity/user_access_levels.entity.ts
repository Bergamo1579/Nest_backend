import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Auth } from './auth.entity';
import { AccessLevel } from './access_levels.entity';

@Entity('user_access_levels')
export class UserAccessLevel {
  @PrimaryColumn({ type: 'char', length: 36 })
  user_uuid: string;

  @PrimaryColumn({ type: 'int', unsigned: true })
  access_level_id: number;

  @ManyToOne(() => Auth)
  @JoinColumn({ name: 'user_uuid' })
  user: Auth;

  @ManyToOne(() => AccessLevel)
  @JoinColumn({ name: 'access_level_id' })
  accessLevel: AccessLevel;
}