import { Injectable, NotFoundException } from '@nestjs/common';
import { ITurma } from './contract/turmas.contract';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Turma } from './entity/turmas.entity';
import { CreateTurmasDto } from './dto/create-turmas.dto';
import { UpdateTurmasDto } from './dto/update-turmas.dto';
import { TurmasQueryDto } from './dto/query-turmas.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TurmasService {
  constructor(
    @InjectRepository(Turma)
    private readonly turmasRepository: Repository<Turma>,
  ) {}

  async findAll(query?: TurmasQueryDto): Promise<ITurma[]> {
    const where: any = {};
    if (query?.id_unidade) {
      where.id_unidade = query.id_unidade;
    }
    // ...outros filtros se quiser...
    return this.turmasRepository.find({ where });
  }

  async create(dto: CreateTurmasDto): Promise<ITurma> {
    const turma = this.turmasRepository.create({
      ...dto,
      id: uuidv4(),
    });
    return this.turmasRepository.save(turma);
  }

  async update(id: string, dto: UpdateTurmasDto): Promise<ITurma> {
    const turma = await this.turmasRepository.findOneBy({ id });
    if (!turma) {
      throw new NotFoundException(`Turma com id ${id} não encontrada`);
    }
    Object.assign(turma, dto);
    return this.turmasRepository.save(turma);
  }

  async delete(id: string): Promise<void> {
    const turma = await this.turmasRepository.findOneBy({ id });
    if (!turma) {
      throw new NotFoundException(`Turma com id ${id} não encontrada`);
    }
    await this.turmasRepository.delete(id);
  }

  async findOne(id: string): Promise<ITurma> {
    const turma = await this.turmasRepository.findOneBy({ id });
    if (!turma) {
      throw new NotFoundException('Turma não encontrada');
    }
    return turma;
  }

}