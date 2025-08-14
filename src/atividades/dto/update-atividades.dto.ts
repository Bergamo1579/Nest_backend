import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateMultiplaEscolhaRespostaDto, CreateMultiplaEscolhaPerguntaDto, CreateObjetivaPerguntaDto } from './create-atividades.dto';

export class UpdateAtividadesDto {
  @ApiProperty({ example: 'Avaliação de Matemática Atualizada', required: false })
  @IsOptional()
  @IsString()
  titulo?: string;

  @ApiProperty({ 
    example: 'mista',
    description: 'Tipo da atividade: multipla, objetiva ou mista',
    enum: ['multipla', 'objetiva', 'mista'],
    required: false
  })
  @IsOptional()
  @IsString()
  @IsIn(['multipla', 'objetiva', 'mista'])
  tipo_atividade?: string;

  @ApiProperty({ type: [CreateMultiplaEscolhaPerguntaDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMultiplaEscolhaPerguntaDto)
  perguntas_multipla?: CreateMultiplaEscolhaPerguntaDto[];

  @ApiProperty({ type: [CreateObjetivaPerguntaDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateObjetivaPerguntaDto)
  perguntas_objetiva?: CreateObjetivaPerguntaDto[];
}