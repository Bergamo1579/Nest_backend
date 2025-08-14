import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt } from 'class-validator';

export class CreateConteudoDto {
  @ApiProperty({ example: 'uuid-aula', description: 'ID da aula' })
  @IsString()
  @IsNotEmpty()
  aula_id: string;

  @ApiProperty({ enum: ['video', 'texto', 'arquivo', 'link', 'imagem', 'quiz'], description: 'Tipo do conteúdo' })
  @IsEnum(['video', 'texto', 'arquivo', 'link', 'imagem', 'quiz'])
  tipo: string;

  @ApiProperty({ example: 1, description: 'Ordem do conteúdo', required: false })
  @IsInt()
  @IsOptional()
  ordem?: number;
}

// Para ARQUIVO
export class CreateConteudoArquivoDto {
  @ApiProperty({ example: 'uuid-conteudo', description: 'ID do conteúdo' })
  @IsString()
  @IsNotEmpty()
  conteudo_id: string;

  @ApiProperty({ example: '/arc/document/arquivo.pdf', description: 'URL do arquivo' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ example: 'Arquivo PDF de apoio', required: false })
  @IsString()
  @IsOptional()
  descricao?: string;

  @ApiProperty({ example: 'pdf', required: false })
  @IsString()
  @IsOptional()
  tipo_arquivo?: string;
}

// Para IMAGEM
export class CreateConteudoImagemDto {
  @ApiProperty({ example: 'uuid-conteudo', description: 'ID do conteúdo' })
  @IsString()
  @IsNotEmpty()
  conteudo_id: string;

  @ApiProperty({ example: '/arc/image/imagem.png', description: 'URL da imagem' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ example: 'Imagem ilustrativa', required: false })
  @IsString()
  @IsOptional()
  descricao?: string;

  @ApiProperty({ example: 800, required: false })
  @IsInt()
  @IsOptional()
  largura?: number;

  @ApiProperty({ example: 600, required: false })
  @IsInt()
  @IsOptional()
  altura?: number;
}

// Para LINK (inclui vídeo)
export class CreateConteudoLinkDto {
  @ApiProperty({ example: 'uuid-conteudo', description: 'ID do conteúdo' })
  @IsString()
  @IsNotEmpty()

  @ApiProperty({ example: 'https://youtube.com/xyz', description: 'URL do link ou vídeo' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ example: 'Vídeo explicativo', required: false })
  @IsString()
  @IsOptional()
  descricao?: string;
}

// Para TEXTO
export class CreateConteudoTextoDto {
  @ApiProperty({ example: 'uuid-conteudo', description: 'ID do conteúdo' })
  @IsString()
  @IsNotEmpty()
  conteudo_id: string;

  @ApiProperty({ example: 'Texto do conteúdo', description: 'Conteúdo textual' })
  @IsString()
  @IsNotEmpty()
  texto: string;
}

// Para IMAGEM (upload)
export class CreateConteudoImagemUploadDto {
  descricao?: string;
  // file é tratado pelo interceptor
}