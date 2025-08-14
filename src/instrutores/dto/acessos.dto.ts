import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateAcessoTemporarioDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  aluno_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  aula_id: string;

  @ApiProperty({ description: 'Senha temporária em texto puro (será hasheada)' })
  @IsString()
  @IsNotEmpty()
  temp_password: string;
}

export class LoginTemporarioDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  aula_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  temp_password: string;
}

export class AcessoTemporarioResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  aluno_id: string;

  @ApiProperty()
  aula_id: string;

  @ApiProperty()
  criado_em: Date;
}