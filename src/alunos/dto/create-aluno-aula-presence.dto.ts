import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAlunoAulaPresenceDto {
  @ApiProperty({example: 'b1a7c2e1-1234-4f56-9abc-1234567890ab',})
  @IsUUID()
  aluno_id: string;

  @ApiProperty({description: 'ID da aula', example: 'c2b7a1e2-5678-4f12-9def-0987654321ba',})
  @IsUUID()
  aula_id: string;
}