import { PartialType } from '@nestjs/swagger';
import { CreateAulaDto } from './create-aulas.dto';

export class UpdateAulaDto extends PartialType(CreateAulaDto) {}