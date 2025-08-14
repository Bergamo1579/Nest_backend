import { IsOptional, IsNumberString, IsString } from 'class-validator';

export class EmpresasQueryDto {
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
}