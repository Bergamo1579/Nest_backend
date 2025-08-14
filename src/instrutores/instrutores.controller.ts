import { Controller, Get, Body, Post, Put, Param, Delete, Query, Inject, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InstrutoresService } from './instrutores.service';
import { Instrutor } from './entity/instrutores.entity';
import { CreateInstrutorDto } from './dto/create-instrutores.dto';
import { UpdateInstrutorDto } from './dto/update-instrutores.dto';
import { SanitizePipe } from '../common/pipes/sanitize.pipe';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Counter } from 'prom-client';
import { InstrutoresQueryDto } from './dto/query-instrutores.dto';
import { AdmPermission } from '../auth/decorators/adm-permission.decorator';
import { AdmPermissionGuard } from '../auth/guards/adm-permission.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; 
import { CreateAcessoTemporarioDto,LoginTemporarioDto ,AcessoTemporarioResponseDto } from './dto/acessos.dto';
import { AcessosTemporarios} from './entity/acessos_entity.entity';


@UseGuards(JwtAuthGuard, AdmPermissionGuard)
@AdmPermission(
  ...(process.env.ADM_ACESS1
    ? process.env.ADM_ACESS1.split(',').map(l => l.trim())
    : [])
)

@ApiTags('Instrutores')
@Controller('instrutores')
export class InstrutoresController {
  constructor(
    private readonly instrutoresService: InstrutoresService,
    @InjectPinoLogger(InstrutoresService.name) private readonly logger: PinoLogger,
    @Inject('PROM_METRIC_INSTRUTORES_REQUESTS_TOTAL') private readonly instrutoresRequests: Counter<string>,
  ) {}
  

  @Get()
  @ApiOperation({ summary: 'Lista todos os instrutores' })
  @ApiResponse({ status: 200, description: 'Lista de instrutores', type: [Instrutor] })
    async findAll(@Query() query: InstrutoresQueryDto): Promise<Instrutor[]> {
    this.instrutoresRequests.inc();
    this.logger.info('Buscando todos os instrutores');
    return this.instrutoresService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Cria um novo instrutor' })
  @ApiResponse({ status: 201, description: 'Instrutor criado com sucesso', type: Instrutor })
    async create(@Body(SanitizePipe) dto: CreateInstrutorDto): Promise<Instrutor> {
      this.instrutoresRequests.inc();
      this.logger.info('Criando novo instrutor', { dto });
    return this.instrutoresService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza um instrutor existente' })
  @ApiResponse({ status: 200, description: 'Instrutor atualizado com sucesso', type: Instrutor })
    async update(@Param('id') id: string, @Body(SanitizePipe) dto: UpdateInstrutorDto): Promise<Instrutor>{
    return this.instrutoresService.update(id, dto);
 }

 @Delete(':id')
 @ApiOperation({ summary: 'Deleta um instrutor' })
 @ApiResponse({ status: 200, description: 'Instrutor deletado com sucesso' })
    async delete(@Param('id') id: string): Promise<void>{
    return this.instrutoresService.delete(id);
 }

 @Get(':id')
 @ApiOperation({ summary: 'Busca um instrutor pelo ID' })
 @ApiResponse({ status: 200, description: 'Instrutor encontrado', type: Instrutor })
    async findOne(@Param('id') id: string ): Promise<Instrutor> {
        return this.instrutoresService.findOne(id);
    }

    @Post('acesso-temporario')
    @ApiOperation({ summary: 'Cria um acesso temporário para um aluno' })
    @ApiResponse({ status: 201, type: AcessosTemporarios })
    async createAcessoTemporario(
      @Body() dto: CreateAcessoTemporarioDto,
      @Request() req
    ): Promise<AcessosTemporarios> {
      return this.instrutoresService.createAcessoTemporario(dto, req.user);
    }
}
