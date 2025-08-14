import { PartialType } from '@nestjs/swagger';
import { CreateAlunoDto } from './create-alunos.dto';

export class UpdateAlunoDto extends PartialType(CreateAlunoDto) {}