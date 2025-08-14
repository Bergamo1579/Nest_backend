import { Controller, Get, Post, Put, Delete, Param, Body, UploadedFile, UseInterceptors, BadRequestException, UseGuards} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ConteudoService } from './conteudo.service';
import { Conteudo } from './entity/conteudo.entity';
import { ConteudoArquivo } from './entity/conteudo.entity';
import { ConteudoLink, ConteudoTexto } from './entity/conteudo.entity';
import { CreateConteudoLinkDto} from './dto/create-conteudo.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdmPermissionGuard } from '../auth/guards/adm-permission.guard';
import { AdmPermission } from '../auth/decorators/adm-permission.decorator';
import * as fs from 'fs/promises';


@UseGuards(JwtAuthGuard, AdmPermissionGuard)
@AdmPermission(
  ...(process.env.ADM_ACESS1
    ? process.env.ADM_ACESS1.split(',').map(l => l.trim())
    : [])
)
@ApiTags('Conteudo')
@Controller('conteudo')
export class ConteudoController {
  constructor(private readonly conteudoService: ConteudoService) {}

  // CRUD principal
  @Get(':id')
  @ApiOperation({ summary: 'Busca um conteúdo pelo ID' })
  @ApiResponse({ status: 200, description: 'Conteúdo encontrado', type: Conteudo })
  async findOne(@Param('id') id: string): Promise<Conteudo> {
    return this.conteudoService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um conteúdo' })
  @ApiResponse({ status: 200, description: 'Conteúdo removido' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.conteudoService.delete(id);
  }

  // IMAGEM
  @Post(':aula_id/imagem')
  @ApiOperation({ summary: 'Adiciona uma imagem à aula' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        descricao: { type: 'string' },
        ordem: { type: 'integer' },
        arquivo: { type: 'string', format: 'binary' }
      }
    }
  })
  @UseInterceptors(FileInterceptor('arquivo', {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new BadRequestException('Apenas imagens são permitidas!'), false);
      }
      cb(null, true);
    }
  }))
  async addImagem(
    @Param('aula_id') aula_id: string,
    @UploadedFile() arquivo: Express.Multer.File,
    @Body('descricao') descricao: string,
    @Body('ordem') ordem: number
  ): Promise<any> {
    return this.conteudoService.addImagemAuto(aula_id, arquivo, descricao, ordem);
  }

  // LINK (inclui vídeo)
  @Post(':aula_id/link')
  @ApiOperation({ summary: 'Adiciona um link ou vídeo à aula' })
  @ApiBody({ type: CreateConteudoLinkDto })
  async addLink(
    @Param('aula_id') aula_id: string,
    @Body() dto: CreateConteudoLinkDto
  ): Promise<ConteudoLink> {
    return this.conteudoService.addLinkAuto(aula_id, dto);
  }

  // TEXTO
  @Post(':aula_id/texto')
  @ApiOperation({ summary: 'Adiciona um texto à aula' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        texto: { type: 'string' }
      },
      required: ['texto']
    }
  })
  async addTexto(
    @Param('aula_id') aula_id: string,
    @Body('texto') texto: string
  ): Promise<ConteudoTexto> {
    if (!texto || typeof texto !== 'string' || texto.trim() === '') {
      throw new BadRequestException('O campo texto é obrigatório.');
    }
    return this.conteudoService.addTextoAuto(aula_id, texto);
  }

  // ARQUIVO (para aula)
  @Post(':aula_id/arquivo')
  @ApiOperation({ summary: 'Adiciona um arquivo à aula' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        descricao: { type: 'string' },
        file: { type: 'string', format: 'binary' }
      }
    }
  })
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowed = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ];
      if (!allowed.includes(file.mimetype)) {
        return cb(new BadRequestException('Apenas arquivos PDF, Word ou PowerPoint são permitidos!'), false);
      }
      cb(null, true);
    }
  }))
  async addArquivo(
    @Param('aula_id') aula_id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('descricao') descricao?: string
  ): Promise<ConteudoArquivo> {
    try {
      const conteudoArquivo = await this.conteudoService.addArquivoAuto(aula_id, file, descricao);

      // 2. Move o arquivo para a pasta final (se necessário)
      // Exemplo: de uploads/tmp para uploads/document
      // const finalPath = path.join('uploads/document', file.filename);
      // await fs.rename(file.path, finalPath);

      return conteudoArquivo;
    } catch (err) {
      // 3. Se der erro no banco, apaga o arquivo salvo
      if (file && file.path) {
        await fs.unlink(file.path).catch(() => {});
      }
      throw err;
    }
  }

  @Put(':conteudo_id')
  @ApiOperation({ summary: 'Atualiza um conteúdo (imagem, arquivo, link ou texto)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        descricao: { type: 'string' },
        ordem: { type: 'integer' },
        texto: { type: 'string' }
      }
    }
  })
  async updateConteudo(
    @Param('conteudo_id') conteudo_id: string,
    @Body('descricao') descricao: string,
    @Body('ordem') ordem: number,
    @Body('texto') texto?: string
  ) {
    return this.conteudoService.updateConteudoGenerico(conteudo_id, descricao, ordem, texto);
  }

  @Get('aula/:aula_id')
  @ApiOperation({ summary: 'Lista todos os conteúdos de uma aula, com detalhes' })
  @ApiResponse({ status: 200, description: 'Conteúdos da aula', type: [Conteudo] })
  async findByAula(@Param('aula_id') aula_id: string) {
    return this.conteudoService.findByAulaWithDetails(aula_id);
  }

  @Put('reorder/:aula_id')
  @ApiOperation({ summary: 'Reordena os conteúdos de uma aula' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reorder: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              conteudo_id: { type: 'string' },
              nova_ordem: { type: 'number' }
            }
          }
        }
      }
    }
  })
  async reorderConteudos(
    @Param('aula_id') aula_id: string,
    @Body('reorder') reorder: Array<{ conteudo_id: string; nova_ordem: number }>
  ) {
    return this.conteudoService.reorderConteudos(aula_id, reorder);
  }
}