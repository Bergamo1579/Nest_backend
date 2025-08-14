import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum } from 'class-validator';

export class CreateAlunoDto {
  @ApiProperty({ example: 'Maria Oliveira' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ example: '123.456.789-00' })
  @IsString()
  @IsNotEmpty()
  cpf: string;

  @ApiProperty({ example: '2005-04-23', description: 'Data de nascimento' })
  @IsDateString()
  @IsNotEmpty()
  data_nascimento: string;

  @ApiProperty({ example: 'uuid-unidade', required: false })
  @IsString()
  @IsOptional()
  unidade_id?: string;

  @ApiProperty({ example: 'uuid-turma', required: false })
  @IsString()
  @IsOptional()
  turma_id?: string;

  @ApiProperty({ example: 'uuid-empresa' })
  @IsString()
  @IsNotEmpty()
  empresa_id: string;

  @ApiProperty({ example: '2025-07-22T09:00:00.000Z', required: false })
  @IsDateString()
  @IsOptional()
  criado_em?: string;

  @ApiProperty({ example: '2025-07-22T09:00:00.000Z', required: false })
  @IsDateString()
  @IsOptional()
  atualizado_em?: string;

  @ApiProperty({ example: 'João Oliveira', required: false })
  @IsString()
  @IsOptional()
  responsavel_nome?: string;

  @ApiProperty({ example: 'F', enum: ['M', 'F'], required: false })
  @IsEnum(['M', 'F'])
  @IsOptional()
  sexo?: 'M' | 'F';

  @ApiProperty({ example: '12.345.678-9', required: false })
  @IsString()
  @IsOptional()
  rg?: string;

  @ApiProperty({ example: 'Rua das Flores, 123', required: false })
  @IsString()
  @IsOptional()
  endereco?: string;

  @ApiProperty({ example: '123', required: false })
  @IsString()
  @IsOptional()
  numero?: string;

  @ApiProperty({ example: 'Apto 45', required: false })
  @IsString()
  @IsOptional()
  complemento?: string;

  @ApiProperty({ example: 'Centro', required: false })
  @IsString()
  @IsOptional()
  bairro?: string;

  @ApiProperty({ example: 'São Paulo', required: false })
  @IsString()
  @IsOptional()
  cidade?: string;

  @ApiProperty({ example: '01000-000', required: false })
  @IsString()
  @IsOptional()
  cep?: string;

  @ApiProperty({ example: '(11) 99999-9999', required: false })
  @IsString()
  @IsOptional()
  celular?: string;

  @ApiProperty({ example: '(11) 98888-8888', required: false })
  @IsString()
  @IsOptional()
  celular_recado?: string;

  @ApiProperty({ example: 'aluno@email.com', required: false })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'Escola Estadual Exemplo', required: false })
  @IsString()
  @IsOptional()
  escola?: string;

  @ApiProperty({ example: '8ª série', required: false })
  @IsString()
  @IsOptional()
  serie?: string;

  @ApiProperty({ example: 'manha', enum: ['manha', 'tarde', 'noite'], required: false })
  @IsEnum(['manha', 'tarde', 'noite'])
  @IsOptional()
  periodo?: 'manha' | 'tarde' | 'noite';
  
}