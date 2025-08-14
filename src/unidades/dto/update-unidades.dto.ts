import { PartialType } from '@nestjs/swagger';
import { CreateUnidadesDto } from './create-unidades.dto';

export class UpdateUnidadesDto extends PartialType(CreateUnidadesDto) {}