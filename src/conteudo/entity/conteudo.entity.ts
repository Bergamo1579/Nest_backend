import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('conteudo')
export class Conteudo {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ type: 'char', length: 36 })
  aula_id: string;

  @Column({ type: 'enum', enum: ['video', 'texto', 'arquivo', 'link', 'imagem', 'quiz'] })
  tipo: string;

  @Column({ type: 'int', nullable: true })
  ordem?: number;
}

@Entity('conteudo_arquivo')
export class ConteudoArquivo {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ type: 'char', length: 36 })
  conteudo_id: string;

  @Column({ type: 'varchar', length: 255 })
  url: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  tipo_arquivo?: string;
}

@Entity('conteudo_imagem')
export class ConteudoImagem {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ type: 'char', length: 36 })
  conteudo_id: string;

  @Column({ type: 'varchar', length: 255 })
  url: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @Column({ type: 'int', nullable: true })
  largura?: number;

  @Column({ type: 'int', nullable: true })
  altura?: number;
}

@Entity('conteudo_link')
export class ConteudoLink {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ type: 'char', length: 36 })
  conteudo_id: string;

  @Column({ type: 'varchar', length: 255 })
  url: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string;
}

@Entity('conteudo_texto')
export class ConteudoTexto {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ type: 'char', length: 36 })
  conteudo_id: string;

  @Column({ type: 'longtext' })
  texto: string;
}