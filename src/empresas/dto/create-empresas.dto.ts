import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateEmpresaDto {
  @ApiProperty({ example: 'Empresa Exemplo' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ example: 'Razão Social Exemplo' })
  @IsString()
  @IsNotEmpty()
  razao_social: string;

  @ApiProperty({ example: '12.345.678/0001-99' })
  @IsString()
  @IsNotEmpty()
  cnpj: string;

  @ApiProperty({ example: '123456789', required: false })
  @IsString()
  @IsOptional()
  inscricao_estadual?: string;

  @ApiProperty({ example: 'Rua Exemplo, Centro', required: false })
  @IsString()
  @IsOptional()
  endereco?: string;

  @ApiProperty({ example: '123', required: false })
  @IsString()
  @IsOptional()
  numero?: string;

  @ApiProperty({ example: 'São Paulo', required: false })
  @IsString()
  @IsOptional()
  cidade?: string;

  @ApiProperty({ example: 'Centro', required: false })
  @IsString()
  @IsOptional()
  bairro?: string;

  @ApiProperty({ example: 'SP', required: false })
  @IsString()
  @IsOptional()
  estado?: string;

  @ApiProperty({ example: '01000-000', required: false })
  @IsString()
  @IsOptional()
  cep?: string;

  @ApiProperty({ example: '(11) 99999-9999', required: false })
  @IsString()
  @IsOptional()
  telefone?: string;

  @ApiProperty({ example: 'empresa@email.com', required: false })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'João da Silva', required: false })
  @IsString()
  @IsOptional()
  representante_nome?: string;

  @ApiProperty({ example: 'Diretor', required: false })
  @IsString()
  @IsOptional()
  representante_cargo?: string;

  // Login e senha
  @ApiProperty({ example: 'empresauser', description: 'Username para login' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'senhaSegura123', description: 'Senha para login' })
  @IsString()
  @IsNotEmpty()
  password: string;
}