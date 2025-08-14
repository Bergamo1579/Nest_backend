import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('unidades')
export class Unidades {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ length: 100 })
  nome: string;

  @Column({ length: 255 })
  localizacao: string;

  constructor(partial: Partial<Unidades>) {
    Object.assign(this, partial);
    
  }
}