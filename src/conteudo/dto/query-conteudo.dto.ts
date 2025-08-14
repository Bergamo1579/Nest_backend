import { IsOptional, IsNumberString, IsString, IsEnum } from 'class-validator';

export class ConteudoQueryDto {
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
  aula_id?: string;

  @IsOptional()
  @IsEnum(['video', 'texto', 'arquivo', 'link', 'imagem', 'quiz'])
  tipo?: string;

  @IsOptional()
  @IsNumberString()
  ordem?: string;
}