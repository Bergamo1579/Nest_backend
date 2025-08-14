import { PartialType } from '@nestjs/swagger';
import { CreateInstrutorDto } from './create-instrutores.dto';

export class UpdateInstrutorDto extends PartialType(CreateInstrutorDto) {}