import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateUnidadesDto {
  @ApiProperty({ example: 'Unidade Central' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ example: 'Centro' })
  @IsString()
  @IsNotEmpty()
  localizacao: string;
}