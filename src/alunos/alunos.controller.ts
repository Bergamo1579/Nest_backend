import { Controller, Get, Body, Post, Put, Param, Delete, Query, Inject, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AlunosService } from './alunos.service';
import { Aluno } from './entity/alunos.entity';
import { CreateAlunoDto } from './dto/create-alunos.dto';
import { UpdateAlunoDto } from './dto/update-alunos.dto';
import { SanitizePipe } from '../common/pipes/sanitize.pipe';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Counter } from 'prom-client';
import { AlunosQueryDto } from './dto/query-alunos.dto';
import { AdmPermission } from '../auth/decorators/adm-permission.decorator';
import { AdmPermissionGuard } from '../auth/guards/adm-permission.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; 
import { LoginTemporarioDto } from '../instrutores/dto/acessos.dto';
import { InstrutoresService } from '../instrutores/instrutores.service'; // Use o service já existente


@UseGuards(JwtAuthGuard, AdmPermissionGuard)
@AdmPermission(
  ...(process.env.ADM_ACESS1
    ? process.env.ADM_ACESS1.split(',').map(l => l.trim())
    : [])
)
@ApiTags('Alunos')
@Controller('alunos')
export class AlunosController {
  constructor(
    private readonly alunosService: AlunosService,
    private readonly instrutoresService: InstrutoresService, // Injete o service aqui
    @InjectPinoLogger(AlunosService.name) private readonly logger: PinoLogger,
    @Inject('PROM_METRIC_ALUNOS_REQUESTS_TOTAL') private readonly alunosRequests: Counter<string>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista todos os alunos (pode filtrar por unidade ou turma)' })
  @ApiResponse({ status: 200, description: 'Lista de alunos', type: [Aluno] })
  async findAll(@Query() query: AlunosQueryDto): Promise<Aluno[]> {
    return this.alunosService.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Cria um novo aluno' })
  @ApiResponse({ status: 201, description: 'Aluno criado com sucesso', type: Aluno })
  async create(@Body(SanitizePipe) dto: CreateAlunoDto): Promise<Aluno> {
    this.alunosRequests.inc();
    this.logger.info('Criando novo aluno', { dto });
    return this.alunosService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza um aluno existente' })
  @ApiResponse({ status: 200, description: 'Aluno atualizado com sucesso', type: Aluno })
  async update(@Param('id') id: string, @Body(SanitizePipe) dto: UpdateAlunoDto): Promise<Aluno> {
    return this.alunosService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deleta um aluno' })
  @ApiResponse({ status: 200, description: 'Aluno deletado com sucesso' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.alunosService.delete(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um aluno pelo ID' })
  @ApiResponse({ status: 200, description: 'Aluno encontrado', type: Aluno })
  async findOne(@Param('id') id: string): Promise<Aluno> {
    return this.alunosService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('acessar-aula')
  @ApiOperation({ summary: 'Valida o acesso temporário do aluno para aula' })
  @ApiResponse({ status: 200, description: 'Acesso temporário validado' })
  async acessarAula(
    @Body() dto: LoginTemporarioDto,
    @Request() req
  ) {
    return this.instrutoresService.validarAcessoTemporario(dto, req.user);
  }
}
