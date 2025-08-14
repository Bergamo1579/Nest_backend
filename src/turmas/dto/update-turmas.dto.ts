import { PartialType } from '@nestjs/swagger';
import { CreateTurmasDto } from './create-turmas.dto';

export class UpdateTurmasDto extends PartialType(CreateTurmasDto) {}