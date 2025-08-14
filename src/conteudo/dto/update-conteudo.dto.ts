import { PartialType } from '@nestjs/swagger';
import { CreateConteudoDto } from './create-conteudo.dto';

export class UpdateConteudoDto extends PartialType(CreateConteudoDto) {}

export class UpdateConteudoArquivoDto extends PartialType(CreateConteudoDto) {}

export class UpdateConteudoImagemDto extends PartialType(CreateConteudoDto) {}

export class UpdateConteudoLinkDto extends PartialType(CreateConteudoDto) {}

export class UpdateConteudoTextoDto extends PartialType(CreateConteudoDto) {}