import { PartialType } from '@nestjs/swagger';
import { CreateTurmaAulaDto } from './create-turma_aula.dto';

export class UpdateTurmaAulaDto extends PartialType(CreateTurmaAulaDto) {}