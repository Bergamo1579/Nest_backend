import { Controller, Get, Body, Post, Put, Param, Delete, Query, Inject, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UnidadesService } from './unidades.service';
import { Unidades } from './entity/unidades.entity';
import { CreateUnidadesDto } from './dto/create-unidades.dto';
import { UpdateUnidadesDto } from './dto/update-unidades.dto';
import { SanitizePipe } from '../common/pipes/sanitize.pipe';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Counter } from 'prom-client';
import { UnidadesQueryDto } from './dto/query-unidades.dto';
import { AdmPermission } from '../auth/decorators/adm-permission.decorator';
import { AdmPermissionGuard } from '../auth/guards/adm-permission.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; 


@UseGuards(JwtAuthGuard, AdmPermissionGuard)
@AdmPermission(
  ...(process.env.UNIDADE_ENDPOINT
    ? process.env.UNIDADE_ENDPOINT.split(',').map(l => l.trim())
    : [])
)

@ApiTags('Unidades')
@Controller('unidades')
export class UnidadesController {
  constructor(
    private readonly unidadesService: UnidadesService,
    @InjectPinoLogger(UnidadesService.name) private readonly logger: PinoLogger,
    @Inject('PROM_METRIC_UNIDADES_REQUESTS_TOTAL') private readonly unidadesRequests: Counter<string>,
  ) {}
  

  @Get()
  @ApiOperation({ summary: 'Lista todas as unidades' })
  @ApiResponse({ status: 200, description: 'Lista de unidades', type: [Unidades] })
    async findAll(@Query() query: UnidadesQueryDto): Promise<Unidades[]> {
    this.unidadesRequests.inc(); // incrementa o contador toda vez que o endpoint é chamado
    this.logger.info('Buscando todas as unidades');
    return this.unidadesService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Cria uma nova unidade' })
  @ApiResponse({ status: 201, description: 'Unidade criada com sucesso', type: Unidades })
    async create(@Body(SanitizePipe) dto: CreateUnidadesDto): Promise<Unidades> {
      this.unidadesRequests.inc(); // Incrementa o contador toda vez que o endpoint é chamado
      this.logger.info('Criando nova unidade', { dto });
    return this.unidadesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza uma unidade existente' })
  @ApiResponse({ status: 200, description: 'Unidade atualizada com sucesso', type: Unidades })
    async update(@Param('id') id: string, @Body(SanitizePipe) dto: UpdateUnidadesDto): Promise<Unidades>{
    return this.unidadesService.update(id, dto);
 }

 @Delete(':id')
 @ApiOperation({ summary: 'Deleta uma unidade' })
 @ApiResponse({ status: 200, description: 'Unidade deletada com sucesso' })
    async delete(@Param('id') id: string): Promise<void>{
    return this.unidadesService.delete(id);
 }

 @Get(':id')
 @ApiOperation({ summary: 'Busca uma unidade pelo ID' })
 @ApiResponse({ status: 200, description: 'Unidade encontrada', type: Unidades })
    async findOne(@Param('id') id: string ): Promise<Unidades> {
        return this.unidadesService.findOne(id);
    }
}
