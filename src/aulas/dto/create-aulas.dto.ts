import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateAulaDto {
  @ApiProperty({ example: 'Introdução à Matemática', description: 'Título da aula' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({ example: 'Conteúdo sobre operações básicas', description: 'Descrição da aula' })
  @IsString()
  @IsNotEmpty()
  descricao: string;
}