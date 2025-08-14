import { IsOptional, IsNumberString, IsString } from 'class-validator';

export class AulasQueryDto {
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
  titulo?: string;

  @IsOptional()
  @IsString()
  descricao?: string;
}

export class RespostaAlunoAtividadeDto {
  id_pergunta: string | null;
  tipo: 'multipla' | 'aberta';
  resposta: string | null;
  acerto?: boolean;
  resultado?: string;
  resposta_correta?: string | null;
}

export class ResultadoAlunoAulaDto {
  id_atividade: string;
  id_aluno: string;
  multiplas: {
    total: number;
    acertos: number;
    aproveitamento: string;
    respostas: RespostaAlunoAtividadeDto[];
  };
  abertas: {
    total: number;
    feitas: number;
    feitura: string;
    respostas: RespostaAlunoAtividadeDto[];
  };
}