import { IsOptional, IsNumberString, IsString } from 'class-validator';

export class UnidadesQueryDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  cidade?: string;
}