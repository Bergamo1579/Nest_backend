import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTurmasDto {
  @ApiProperty({ example: 'Turma A', description: 'Nome da turma' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ example: 'Turma de matemática do turno da manhã', description: 'Descrição da turma', required: false })
  @IsString()
  @IsOptional()
  descricao?: string;

  @ApiProperty({ example: 'uuid-unidade', description: 'ID da unidade (UUID)', required: false })
  @IsString()
  @IsOptional()
  id_unidade?: string;
}