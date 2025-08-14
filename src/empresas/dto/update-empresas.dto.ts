import { PartialType } from '@nestjs/swagger';
import { CreateEmpresaDto } from './create-empresas.dto';

export class UpdateEmpresaDto extends PartialType(CreateEmpresaDto) {}