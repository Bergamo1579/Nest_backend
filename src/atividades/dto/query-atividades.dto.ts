import { IsOptional, IsNumberString, IsString } from 'class-validator';

export class AtividadesQueryDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsString()
  aula_id?: string;

  @IsOptional()
  @IsString()
  tipo_atividade?: string;
}