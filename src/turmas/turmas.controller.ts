import { Controller, Get, Body, Post, Put, Param, Delete, Query, Inject, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TurmasService } from './turmas.service';
import { Turma } from './entity/turmas.entity';
import { CreateTurmasDto } from './dto/create-turmas.dto';
import { UpdateTurmasDto } from './dto/update-turmas.dto';
import { SanitizePipe } from '../common/pipes/sanitize.pipe';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Counter } from 'prom-client';
import { TurmasQueryDto } from './dto/query-turmas.dto';
import { AdmPermission } from '../auth/decorators/adm-permission.decorator';
import { AdmPermissionGuard } from '../auth/guards/adm-permission.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; 

@UseGuards(JwtAuthGuard, AdmPermissionGuard)
@AdmPermission(
  ...(process.env.ADM_ACESS1
    ? process.env.ADM_ACESS1.split(',').map(l => l.trim())
    : [])
)
@ApiTags('Turmas')
@Controller('turmas')
export class TurmasController {
  constructor(
    private readonly turmasService: TurmasService,
    @InjectPinoLogger(TurmasService.name) private readonly logger: PinoLogger,
    @Inject('PROM_METRIC_TURMAS_REQUESTS_TOTAL') private readonly turmasRequests: Counter<string>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista todas as turmas (pode filtrar por unidade)' })
  @ApiResponse({ status: 200, description: 'Lista de turmas', type: [Turma] })
  async findAll(@Query() query: TurmasQueryDto): Promise<Turma[]> {
    this.turmasRequests.inc();
    this.logger.info('Buscando todas as turmas', { query });
    return this.turmasService.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Cria uma nova turma' })
  @ApiResponse({ status: 201, description: 'Turma criada com sucesso', type: Turma })
  async create(@Body(SanitizePipe) dto: CreateTurmasDto): Promise<Turma> {
    this.turmasRequests.inc();
    this.logger.info('Criando nova turma', { dto });
    return this.turmasService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza uma turma existente' })
  @ApiResponse({ status: 200, description: 'Turma atualizada com sucesso', type: Turma })
  async update(@Param('id') id: string, @Body(SanitizePipe) dto: UpdateTurmasDto): Promise<Turma> {
    return this.turmasService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deleta uma turma' })
  @ApiResponse({ status: 200, description: 'Turma deletada com sucesso' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.turmasService.delete(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma turma pelo ID' })
  @ApiResponse({ status: 200, description: 'Turma encontrada', type: Turma })
  async findOne(@Param('id') id: string): Promise<Turma> {
    return this.turmasService.findOne(id);
  }
}