import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateInstrutorDto {
  @ApiProperty({ example: 'João da Silva', description: 'Nome do instrutor' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ example: 'Instrutor de Pilates', description: 'Descrição do instrutor', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'uuid-unidade', description: 'ID da unidade (UUID)' })
  @IsString()
  @IsNotEmpty()
  id_unidade: string;

  @ApiProperty({ example: 'joaosilva', description: 'Username do instrutor' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'senhaSegura123', description: 'Senha do instrutor' })
  @IsString()
  @IsNotEmpty()
  password: string;
}