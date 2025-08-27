import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ITurmaAula } from './contract/turma_aula.contract';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TurmaAula } from './entity/turma_aula.entity';
import { CreateTurmaAulaDto } from './dto/create-turma_aula.dto';
import { TurmaAulaQueryDto } from './dto/query-turma_aula.dto';
import { v4 as uuidv4 } from 'uuid';
import { Turma } from '../turmas/entity/turmas.entity'; // ajuste o caminho conforme sua estrutura
import { Aluno } from '../alunos/entity/alunos.entity'; // ajuste o caminho conforme sua estrutura

// Função para obter a data/hora atual de Brasília (UTC-3)
function getNowBrasilia(): Date {
  const now = new Date();
  return new Date(now.getTime() - 3 * 60 * 60 * 1000);
}

function toBrasilia(date: Date): Date {
  // Ajusta para UTC-3
  return new Date(date.getTime() - 3 * 60 * 60 * 1000);
}

@Injectable()
export class TurmaAulaService {
  constructor(
    @InjectRepository(TurmaAula)
    private readonly turmaAulaRepository: Repository<TurmaAula>,
    @InjectRepository(Turma)
    private readonly turmaRepository: Repository<Turma>,
    @InjectRepository(Aluno)
    private readonly alunoRepository: Repository<Aluno>,
  ) {}

  async create(dto: CreateTurmaAulaDto): Promise<ITurmaAula> {
    // Buscar unidade da turma
    const turma = await this.turmaRepository.findOneBy({ id: dto.turma_id });
    if (!turma) throw new NotFoundException('Turma não encontrada');
    const unidade_id = turma.id_unidade;

    // Verificação de coerência de horários
    if (dto.horario_fim && dto.horario_inicio >= dto.horario_fim) {
      throw new BadRequestException('horario_inicio deve ser menor que horario_fim');
    }

    // Verificação de data e horário no futuro
    const nowBrasilia = getNowBrasilia();
    const agendamentoBrasilia = new Date(`${dto.data_aula}T${dto.horario_inicio}:00`);

    if (agendamentoBrasilia < nowBrasilia) {
      throw new BadRequestException('Não é permitido agendar para o passado');
    }

    const agendamentoEntity = this.turmaAulaRepository.create({
      ...dto,
      unidade_id,
      id: uuidv4(),
    });
    return this.turmaAulaRepository.save(agendamentoEntity);
  }

  async updateAgendamento(id: string, dto: Partial<Pick<TurmaAula, 'data_aula' | 'horario_inicio' | 'horario_fim'>>): Promise<ITurmaAula> {
    const agendamento = await this.turmaAulaRepository.findOneBy({ id });
    if (!agendamento) {
      throw new NotFoundException(`Agendamento com id ${id} não encontrado`);
    }
    Object.assign(agendamento, dto);
    return this.turmaAulaRepository.save(agendamento);
  }

  async delete(id: string): Promise<void> {
    const agendamento = await this.turmaAulaRepository.findOneBy({ id });
    if (!agendamento) {
      throw new NotFoundException(`Agendamento com id ${id} não encontrado`);
    }
    await this.turmaAulaRepository.delete(id);
  }

  async findAll(query: TurmaAulaQueryDto): Promise<ITurmaAula[]> {
    const where: any = {};
    if (query.turma_id) where.turma_id = query.turma_id;
    if (query.aula_id) where.aula_id = query.aula_id;
    if (query.unidade_id) where.unidade_id = query.unidade_id;
    if (query.data_aula) where.data_aula = query.data_aula;
    if (query.id) where.id = query.id;
    if (query.horario_inicio) where.horario_inicio = query.horario_inicio;
    if (query.horario_fim) where.horario_fim = query.horario_fim;

    return this.turmaAulaRepository.find({ where });
  }

  async findByTurma(turma_id: string): Promise<ITurmaAula[]> {
    return this.turmaAulaRepository.find({ where: { turma_id } });
  }

  async findByUnidade(unidade_id: string): Promise<ITurmaAula[]> {
    return this.turmaAulaRepository.find({ where: { unidade_id } });
  }

  async findByDia(data_aula: string): Promise<ITurmaAula[]> {
    return this.turmaAulaRepository.find({ where: { data_aula } });
  }

  async findAtivosAgora(): Promise<ITurmaAula[]> {
    const now = new Date();
    const dia = now.toISOString().slice(0, 10);
    const hora = now.toTimeString().slice(0, 8);

    return this.turmaAulaRepository
      .createQueryBuilder('ta')
      .where('ta.data_aula = :dia', { dia })
      .andWhere('ta.horario_inicio <= :hora', { hora })
      .andWhere('(ta.horario_fim IS NULL OR ta.horario_fim >= :hora)', { hora })
      .getMany();
  }

  async findAtivosAgoraPorTurma(turma_id: string): Promise<ITurmaAula[]> {
    const now = new Date();
    const dia = now.toISOString().slice(0, 10);
    const hora = now.toTimeString().slice(0, 8);

    return this.turmaAulaRepository
      .createQueryBuilder('ta')
      .where('ta.turma_id = :turma_id', { turma_id })
      .andWhere('ta.data_aula = :dia', { dia })
      .andWhere('ta.horario_inicio <= :hora', { hora })
      .andWhere('(ta.horario_fim IS NULL OR ta.horario_fim >= :hora)', { hora })
      .getMany();
  }

  async findAtivosAgoraPorAluno(aluno_id: string): Promise<ITurmaAula[]> {
    // Busca o aluno e obtém o turma_id
    const aluno = await this.alunoRepository.findOneBy({ id: aluno_id });
    if (!aluno || !aluno.turma_id) return [];
    return this.findAtivosAgoraPorTurma(aluno.turma_id);
  }

  async findAtivosAgoraPorInstrutor(instrutor_id: string, unidade_id: string): Promise<ITurmaAula[]> {
    // Busca todas as turmas da unidade informada
    const turmas = await this.turmaRepository.find({
      where: { id_unidade: unidade_id }
    });
    const turmaIds = turmas.map(t => t.id);
    if (!turmaIds.length) return [];

    const now = new Date();
    const dia = now.toISOString().slice(0, 10);
    const hora = now.toTimeString().slice(0, 8);

    return this.turmaAulaRepository
      .createQueryBuilder('ta')
      .where('ta.turma_id IN (:...turmaIds)', { turmaIds })
      .andWhere('ta.unidade_id = :unidade_id', { unidade_id })
      .andWhere('ta.data_aula = :dia', { dia })
      .andWhere('ta.horario_inicio <= :hora', { hora })
      .andWhere('(ta.horario_fim IS NULL OR ta.horario_fim >= :hora)', { hora })
      .getMany();
  }

  async findOne(id: string): Promise<ITurmaAula> {
    const agendamento = await this.turmaAulaRepository.findOne({ where: { id } });
    if (agendamento) {
      agendamento.data_aula = toBrasilia(new Date(agendamento.data_aula)).toISOString().substring(0, 10);
      agendamento.horario_inicio = toBrasilia(new Date(`${agendamento.data_aula}T${agendamento.horario_inicio}`)).toTimeString().substring(0, 8);
      // ...idem para horario_fim
    }
    if (!agendamento) {
      throw new NotFoundException('Agendamento não encontrado');
    }
    return agendamento;
  }
}