import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString, IsOptional, Matches, ValidateIf } from 'class-validator';

export class CreateTurmaAulaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  turma_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  aula_id: string;

  @ApiProperty({ example: '2025-07-23' })
  @IsDateString({}, { message: 'data_aula deve ser uma data válida (YYYY-MM-DD)' })
  data_aula: string;

  @ApiProperty({ example: '08:00:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/, { message: 'horario_inicio deve ser no formato HH:mm:ss' })
  horario_inicio: string;

  @ApiProperty({ example: '09:00:00', required: false })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/, { message: 'horario_fim deve ser no formato HH:mm:ss' })
  horario_fim?: string;
}