import { ApiProperty } from '@nestjs/swagger';

export class FaltasQueryDto {
  @ApiProperty({ example: '56604969-c1c3-4342-b307-680d7070b2fa', description: 'ID do aluno' })
  aluno_id: string;

  @ApiProperty({ example: '2025-07-01', description: 'Data inicial (YYYY-MM-DD)' })
  data_inicio: string;

  @ApiProperty({ example: '2025-08-29', description: 'Data final (YYYY-MM-DD)' })
  data_fim: string;
}

interface FaltaQueryResult {
  aula_id: string;
  nome_aula: string;
  data_aula: string;
  presenca: number;
}