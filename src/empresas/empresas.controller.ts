import { Controller, Get, Body, Post, Put, Param, Delete, Query, Inject, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmpresasService } from './empresas.service';
import { Empresa } from './entity/empresas.entity';
import { CreateEmpresaDto } from './dto/create-empresas.dto';
import { UpdateEmpresaDto } from './dto/update-empresas.dto';
import { SanitizePipe } from '../common/pipes/sanitize.pipe';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Counter } from 'prom-client';
import { EmpresasQueryDto } from './dto/query-empresas.dto';
import { AdmPermission } from '../auth/decorators/adm-permission.decorator';
import { AdmPermissionGuard } from '../auth/guards/adm-permission.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; 


@UseGuards(JwtAuthGuard, AdmPermissionGuard)

@AdmPermission(
  ...(process.env.ADM_ACESS1
    ? process.env.ADM_ACESS1.split(',').map(l => l.trim())
    : [])
)
@ApiTags('Empresas')
@Controller('empresas')
export class EmpresasController {
  constructor(
    private readonly empresasService: EmpresasService,
    @InjectPinoLogger(EmpresasService.name) private readonly logger: PinoLogger,
    @Inject('PROM_METRIC_EMPRESAS_REQUESTS_TOTAL') private readonly empresasRequests: Counter<string>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista todas as empresas' })
  @ApiResponse({ status: 200, description: 'Lista de empresas', type: [Empresa] })
  async findAll(@Query() query: EmpresasQueryDto): Promise<Empresa[]> {
    this.empresasRequests.inc();
    this.logger.info('Buscando todas as empresas');
    return this.empresasService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Cria uma nova empresa' })
  @ApiResponse({ status: 201, description: 'Empresa criada com sucesso', type: Empresa })
  async create(@Body(SanitizePipe) dto: CreateEmpresaDto): Promise<Empresa> {
    this.empresasRequests.inc();
    this.logger.info('Criando nova empresa', { dto });
    return this.empresasService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza uma empresa existente' })
  @ApiResponse({ status: 200, description: 'Empresa atualizada com sucesso', type: Empresa })
  async update(@Param('id') id: string, @Body(SanitizePipe) dto: UpdateEmpresaDto): Promise<Empresa> {
    return this.empresasService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deleta uma empresa' })
  @ApiResponse({ status: 200, description: 'Empresa deletada com sucesso' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.empresasService.delete(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma empresa pelo ID' })
  @ApiResponse({ status: 200, description: 'Empresa encontrada', type: Empresa })
  async findOne(@Param('id') id: string): Promise<Empresa> {
    return this.empresasService.findOne(id);


    
  }

  
}
