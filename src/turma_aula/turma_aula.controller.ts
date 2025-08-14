import { Controller, Get, Body, Post, Put, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TurmaAulaService } from './turma_aula.service';
import { TurmaAula } from './entity/turma_aula.entity';
import { CreateTurmaAulaDto } from './dto/create-turma_aula.dto';
import { TurmaAulaQueryDto } from './dto/query-turma_aula.dto';

@ApiTags('TurmaAula')
@Controller('turma_aula')
export class TurmaAulaController {
  constructor(private readonly turmaAulaService: TurmaAulaService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo agendamento de turma/aula' })
  @ApiResponse({ status: 201, description: 'Agendamento criado com sucesso', type: TurmaAula })
  async create(@Body() dto: CreateTurmaAulaDto): Promise<TurmaAula> {
    return this.turmaAulaService.create(dto);
  }

  @Put(':id/data-horario')
  @ApiOperation({ summary: 'Edita data e horário do agendamento' })
  @ApiResponse({ status: 200, description: 'Agendamento atualizado', type: TurmaAula })
  async updateAgendamento(
    @Param('id') id: string,
    @Body() dto: Partial<Pick<TurmaAula, 'data_aula' | 'horario_inicio' | 'horario_fim'>>
  ): Promise<TurmaAula> {
    return this.turmaAulaService.updateAgendamento(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Exclui um agendamento' })
  @ApiResponse({ status: 200, description: 'Agendamento excluído' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.turmaAulaService.delete(id);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os agendamentos ou filtra por query' })
  @ApiResponse({ status: 200, description: 'Lista de agendamentos', type: [TurmaAula] })
  async findAll(@Query() query: TurmaAulaQueryDto): Promise<TurmaAula[]> {
    return this.turmaAulaService.findAll(query);
  }

  @Get('turma/:turma_id')
  @ApiOperation({ summary: 'Lista agendamentos por turma' })
  async findByTurma(@Param('turma_id') turma_id: string): Promise<TurmaAula[]> {
    return this.turmaAulaService.findByTurma(turma_id);
  }

  @Get('unidade/:unidade_id')
  @ApiOperation({ summary: 'Lista agendamentos por unidade' })
  async findByUnidade(@Param('unidade_id') unidade_id: string): Promise<TurmaAula[]> {
    return this.turmaAulaService.findByUnidade(unidade_id);
  }

  @Get('dia/:data_aula')
  @ApiOperation({ summary: 'Lista agendamentos por dia' })
  async findByDia(@Param('data_aula') data_aula: string): Promise<TurmaAula[]> {
    return this.turmaAulaService.findByDia(data_aula);
  }

  @Get('ativos')
  @ApiOperation({ summary: 'Lista agendamentos ativos no momento' })
  async findAtivosAgora(): Promise<TurmaAula[]> {
    return this.turmaAulaService.findAtivosAgora();
  }

  @Get('ativos/turma/:turma_id')
  @ApiOperation({ summary: 'Lista agendamentos ativos no momento por turma' })
  async findAtivosAgoraPorTurma(@Param('turma_id') turma_id: string): Promise<TurmaAula[]> {
    return this.turmaAulaService.findAtivosAgoraPorTurma(turma_id);
  }

  @Get('ativos/aluno/:aluno_id')
  @ApiOperation({ summary: 'Lista agendamentos ativos no momento por aluno' })
  async findAtivosAgoraPorAluno(@Param('aluno_id') aluno_id: string): Promise<TurmaAula[]> {
    return this.turmaAulaService.findAtivosAgoraPorAluno(aluno_id);
  }

  @Get('ativos/instrutor/:instrutor_id/unidade/:unidade_id')
  @ApiOperation({ summary: 'Lista agendamentos ativos no momento por instrutor e unidade' })
  async findAtivosAgoraPorInstrutor(
    @Param('instrutor_id') instrutor_id: string,
    @Param('unidade_id') unidade_id: string
  ): Promise<TurmaAula[]> {
    return this.turmaAulaService.findAtivosAgoraPorInstrutor(instrutor_id, unidade_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um agendamento pelo ID' })
  @ApiResponse({ status: 200, description: 'Agendamento encontrado', type: TurmaAula })
  async findOne(@Param('id') id: string): Promise<TurmaAula> {
    return this.turmaAulaService.findOne(id);
  }
}