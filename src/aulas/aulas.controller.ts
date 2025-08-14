import { Controller, Get, Body, Post, Put, Param, Delete, Query, Inject, UseGuards, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { AulasService } from './aulas.service';
import { Aula } from './entity/aulas.entity';
import { CreateAulaDto } from './dto/create-aulas.dto';
import { UpdateAulaDto } from './dto/update-aulas.dto';
import { SanitizePipe } from '../common/pipes/sanitize.pipe';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Counter } from 'prom-client';
import { AulasQueryDto } from './dto/query-aulas.dto';
import { AdmPermission } from '../auth/decorators/adm-permission.decorator';
import { AdmPermissionGuard } from '../auth/guards/adm-permission.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { AtividadesService } from '../atividades/atividades.service';
import { ResultadoAlunoAulaDto } from './dto/query-aulas.dto';

@UseGuards(JwtAuthGuard, AdmPermissionGuard)
@AdmPermission(
  ...(process.env.ADM_ACESS1
    ? process.env.ADM_ACESS1.split(',').map(l => l.trim())
    : [])
)
@ApiTags('Aulas')
@Controller('aulas')
export class AulasController {
  constructor(
    private readonly aulasService: AulasService,
    private readonly atividadesService: AtividadesService,
    @InjectPinoLogger(AulasService.name) private readonly logger: PinoLogger,
    @Inject('PROM_METRIC_AULAS_REQUESTS_TOTAL') private readonly aulasRequests: Counter<string>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista todas as aulas' })
  @ApiResponse({ status: 200, description: 'Lista de aulas', type: [Aula] })
  async findAll(@Query() query: AulasQueryDto): Promise<Aula[]> {
    this.aulasRequests.inc();
    this.logger.info('Buscando todas as aulas');
    return this.aulasService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Cria uma nova aula' })
  @ApiResponse({ status: 201, description: 'Aula criada com sucesso', type: Aula })
  @ApiConsumes('multipart/form-data') // Indica que o endpoint aceita multipart/form-data
  @ApiBody({
    description: 'Dados para criar uma aula, incluindo o arquivo de imagem',
    type: CreateAulaDto,
  })
  @UseInterceptors(FileInterceptor('file')) // Configura o interceptor para receber o arquivo
  async create(
    @Body(SanitizePipe) dto: CreateAulaDto,
    @UploadedFile() file: Express.Multer.File, // Recebe o arquivo enviado
  ): Promise<Aula> {
    if (!file) {
      throw new BadRequestException('O arquivo de imagem é obrigatório');
    }
    this.aulasRequests.inc();
    this.logger.info('Criando nova aula', { dto });
    return this.aulasService.create(dto, file); // Certifique-se de que o service retorna uma instância de Aula
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza uma aula existente' })
  @ApiResponse({ status: 200, description: 'Aula atualizada com sucesso', type: Aula })
  async update(@Param('id') id: string, @Body(SanitizePipe) dto: UpdateAulaDto): Promise<Aula> {
    return this.aulasService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deleta uma aula' })
  @ApiResponse({ status: 200, description: 'Aula deletada com sucesso' })
  async delete(@Param('id') id: string): Promise<{ message: string; detalhes: any }> {
    return this.aulasService.delete(id);
  }

  @Get('aula-resultado')
  async resultadoAlunoAula(
    @Query('aula_id') aula_id: string,
    @Query('id_aluno') id_aluno: string
  ): Promise<ResultadoAlunoAulaDto[]> {
    return this.aulasService.resultadoAlunoAula(aula_id, id_aluno);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Aula> {
    return this.aulasService.findOne(id);
  }
}