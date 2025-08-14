import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, ValidateNested, IsOptional, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMultiplaEscolhaRespostaDto {
  @ApiProperty({ example: 'A' })
  @IsString()
  @IsNotEmpty()
  opcao: string;

  @ApiProperty({ example: 'Resposta da alternativa A' })
  @IsString()
  @IsNotEmpty()
  texto_resposta: string;
}

export class CreateMultiplaEscolhaPerguntaDto {
  @ApiProperty({ example: 1 })
  numero_questao: number;

  @ApiProperty({ example: 'Qual é a capital do Brasil?' })
  @IsString()
  @IsNotEmpty()
  texto_pergunta: string;

  @ApiProperty({ 
    type: [CreateMultiplaEscolhaRespostaDto],
    example: [
      { "opcao": "A", "texto_resposta": "Brasília" },
      { "opcao": "B", "texto_resposta": "São Paulo" },
      { "opcao": "C", "texto_resposta": "Rio de Janeiro" },
      { "opcao": "D", "texto_resposta": "Salvador" }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMultiplaEscolhaRespostaDto)
  respostas: CreateMultiplaEscolhaRespostaDto[];

  @ApiProperty({ example: 'A', description: 'Letra da resposta correta' })
  @IsString()
  @IsNotEmpty()
  resposta_correta: string;
}

export class CreateObjetivaPerguntaDto {
  @ApiProperty({ example: 'Explique o conceito de POO' })
  @IsString()
  @IsNotEmpty()
  texto_questao: string;
}

export class CreateAtividadesDto {
  @ApiProperty({ example: 'aula-123' })
  @IsString()
  @IsNotEmpty()
  aula_id: string;

  @ApiProperty({ example: 'Avaliação de Matemática' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({ 
    example: 'mista',
    description: 'Tipo da atividade: multipla, objetiva ou mista',
    enum: ['multipla', 'objetiva', 'mista']
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['multipla', 'objetiva', 'mista'])
  tipo_atividade: string;

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