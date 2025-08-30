import { ApiProperty } from '@nestjs/swagger';

export class FaltaAulaDto {
  @ApiProperty()
  aula_id: string;

  @ApiProperty()
  nome_aula: string;

  @ApiProperty()
  data_aula: string;
}

export class FaltasResponseDto {
  @ApiProperty()
  total_aulas: number;

  @ApiProperty()
  total_presencas: number;

  @ApiProperty()
  total_faltas: number;

  @ApiProperty({ type: [FaltaAulaDto] })
  faltas: FaltaAulaDto[];
}

interface FaltaQueryResult {
  aula_id: string;
  nome_aula: string;
  data_aula: string;
  presenca: number;
}