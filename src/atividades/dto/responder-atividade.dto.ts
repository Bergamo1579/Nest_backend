import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class RespostaPerguntaDto {
  @ApiProperty({ example: 'pergunta-uuid-123' })
  @IsString()
  @IsNotEmpty()
  id_pergunta: string;

  @ApiProperty({ 
    example: 'A', 
    description: 'Para múltipla escolha: A, B, C, D, E. Para aberta: deixar vazio',
    required: false 
  })
  @IsOptional()
  @IsString()
  resposta_multipla?: string;

  @ApiProperty({ 
    example: 'caminho/para/arquivo.pdf', 
    description: 'Para pergunta aberta: caminho do arquivo. Para múltipla escolha: deixar vazio',
    required: false 
  })
  @IsOptional()
  @IsString()
  resposta_aberta?: string;
}

export class ResponderAtividadeCompletaDto {
  @ApiProperty({ 
    type: [RespostaPerguntaDto],
    description: 'Array com todas as respostas da atividade' 
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RespostaPerguntaDto)
  respostas: RespostaPerguntaDto[];

  @ApiProperty({ example: 'atividade-uuid-123' })
  @IsString()
  @IsNotEmpty()
  id_atividade: string;

  @ApiProperty({ example: 'aluno-uuid-123' })
  @IsString()
  @IsNotEmpty()
  id_aluno: string;
}

// Manter os DTOs antigos para compatibilidade
export class ResponderMultiplaEscolhaDto {
  @ApiProperty({ example: ['A', 'B', 'C'] })
  @IsArray()
  @IsString({ each: true })
  respostas: string[];
}

export class ResponderObjetivaDto {
  @ApiProperty({ example: 'caminho/para/arquivo.pdf' })
  @IsString()
  @IsNotEmpty()
  caminho_arquivo: string;
}

export class ResponderMultiplaEscolhaPerguntaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id_atividade: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id_pergunta: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id_aluno: string;

  @ApiProperty({ example: 'A' })
  @IsString()
  @IsNotEmpty()
  resposta: string;
}

export class ResponderAbertaPerguntaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id_atividade: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id_pergunta: string; // Agora é obrigatório

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id_aluno: string;

  @ApiProperty({ example: 'caminho/arquivo.pdf' })
  @IsString()
  @IsNotEmpty()
  caminho_arquivo: string;
}