import { IsOptional, IsNumberString, IsString, IsDateString } from 'class-validator';

export class TurmaAulaQueryDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  turma_id?: string;

  @IsOptional()
  @IsString()
  aula_id?: string;

  @IsOptional()
  @IsDateString()
  data_aula?: string;

  @IsOptional()
  @IsString()
  horario_inicio?: string;

  @IsOptional()
  @IsString()
  horario_fim?: string;

  @IsOptional()
  @IsString()
  unidade_id?: string;
}