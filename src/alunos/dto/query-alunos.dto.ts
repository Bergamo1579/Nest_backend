import { IsOptional, IsNumberString, IsString, IsEnum } from 'class-validator';

export class AlunosQueryDto {
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
  nome?: string;

  @IsOptional()
  @IsString()
  cpf?: string;

  @IsOptional()
  @IsString()
  unidade_id?: string;

  @IsOptional()
  @IsString()
  turma_id?: string;

  @IsOptional()
  @IsString()
  empresa_id?: string;

  @IsOptional()
  @IsString()
  responsavel_nome?: string;

  @IsOptional()
  @IsEnum(['M', 'F'])
  sexo?: 'M' | 'F';

  @IsOptional()
  @IsString()
  rg?: string;

  @IsOptional()
  @IsString()
  cidade?: string;

  @IsOptional()
  @IsString()
  bairro?: string;

  @IsOptional()
  @IsString()
  escola?: string;

  @IsOptional()
  @IsString()
  serie?: string;

  @IsOptional()
  @IsEnum(['manha', 'tarde', 'noite'])
  periodo?: 'manha' | 'tarde' | 'noite';
}