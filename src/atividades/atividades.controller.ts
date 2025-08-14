import { Controller, Get, Body, Post, Put, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AtividadesService } from './atividades.service';
import { Atividades } from './entity/atividades.entity';
import { CreateAtividadesDto } from './dto/create-atividades.dto';
import { UpdateAtividadesDto } from './dto/update-atividades.dto';
import { ResponderMultiplaEscolhaPerguntaDto, ResponderAbertaPerguntaDto, ResponderAtividadeCompletaDto } from './dto/responder-atividade.dto';
import { AtividadesQueryDto } from './dto/query-atividades.dto';
import { AdmPermission } from '../auth/decorators/adm-permission.decorator';
import { AdmPermissionGuard } from '../auth/guards/adm-permission.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Atividades')
@Controller('atividades')
export class AtividadesController {
  constructor(private readonly atividadesService: AtividadesService) {}

  @Post()
  @UseGuards(AdmPermissionGuard)
  @AdmPermission(
    ...(process.env.ATIVIDADES_ENDPOINT
      ? process.env.ATIVIDADES_ENDPOINT.split(',').map(l => l.trim())
      : [])
  )
  @ApiOperation({ summary: 'Cria uma nova atividade' })
  @ApiResponse({ status: 201, description: 'Atividade criada com sucesso', type: Atividades })
  async create(@Body() dto: CreateAtividadesDto): Promise<Atividades> {
    return this.atividadesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as atividades por aula' })
  @ApiResponse({ status: 200, description: 'Lista de atividades', type: [Atividades] })
  async findAll(@Query('aula_id') aulaId: string): Promise<Atividades[]> {
    return this.atividadesService.findAll(aulaId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma atividade pelo ID' })
  @ApiResponse({ status: 200, description: 'Atividade encontrada', type: Atividades })
  async findOne(@Param('id') id: string): Promise<Atividades> {
    return this.atividadesService.findOne(id);
  }

  @Post('responder-multipla')
  @ApiOperation({ summary: 'Responde uma pergunta de múltipla escolha' })
  @ApiResponse({ status: 200, description: 'Resposta registrada com sucesso' })
  async responderMultiplaEscolhaPergunta(
    @Body() dto: ResponderMultiplaEscolhaPerguntaDto
  ) {
    return this.atividadesService.responderMultiplaEscolhaPergunta(dto);
  }

  @Post('responder-aberta')
  @ApiOperation({ summary: 'Responde uma pergunta aberta' })
  @ApiResponse({ status: 200, description: 'Resposta registrada com sucesso' })
  async responderAbertaPergunta(
    @Body() dto: ResponderAbertaPerguntaDto
  ) {
    return this.atividadesService.responderAbertaPergunta(dto);
  }

  @Post('responder-completa')
  @ApiOperation({ summary: 'Responde uma atividade completa (todas as perguntas)' })
  @ApiResponse({ status: 200, description: 'Respostas registradas com sucesso' })
  async responderAtividadeCompleta(
    @Body() dto: ResponderAtividadeCompletaDto
  ) {
    return this.atividadesService.responderAtividadeCompleta(dto);
  }

  @Delete(':id')
  @UseGuards(AdmPermissionGuard)
  @AdmPermission(
    ...(process.env.ATIVIDADES_ENDPOINT
      ? process.env.ATIVIDADES_ENDPOINT.split(',').map(l => l.trim())
      : [])
  )
  @ApiOperation({ summary: 'Deleta uma atividade e todos os dados relacionados' })
  @ApiResponse({ status: 200, description: 'Atividade deletada com sucesso' })
  async delete(@Param('id') id: string) {
    return this.atividadesService.delete(id);
  }

  @Put(':id')
  @UseGuards(AdmPermissionGuard)
  @AdmPermission(
    ...(process.env.ATIVIDADES_ENDPOINT
      ? process.env.ATIVIDADES_ENDPOINT.split(',').map(l => l.trim())
      : [])
  )
  @ApiOperation({
    summary: 'Atualiza uma atividade existente',
    description: 'Permite editar título, tipo e perguntas. ATENÇÃO: Não é possível editar atividades que já possuem respostas de alunos.'
  })
  @ApiResponse({ status: 200, description: 'Atividade atualizada com sucesso', type: Atividades })
  @ApiResponse({ status: 400, description: 'Atividade já possui respostas ou dados inválidos' })
  @ApiResponse({ status: 404, description: 'Atividade não encontrada' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAtividadesDto
  ): Promise<Atividades> {
    return this.atividadesService.update(id, dto);
  }
}