import { Injectable, NotFoundException } from '@nestjs/common';
import { IUnidade } from './contract/unidades.contract';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Unidades } from './entity/unidades.entity';
import { CreateUnidadesDto } from './dto/create-unidades.dto';
import { UpdateUnidadesDto } from './dto/update-unidades.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UnidadesService {
    constructor(
        @InjectRepository(Unidades)
        private readonly unidadesRepository: Repository<Unidades>,

    ) {}
    async findAll(): Promise<IUnidade[]> {
        return this.unidadesRepository.find();
    }
    async create(dto: CreateUnidadesDto): Promise<IUnidade> {
        const unidade = this.unidadesRepository.create({
            ...dto,
            id: uuidv4(),
        })
        return this.unidadesRepository.save(unidade);
    }
    async update(id: string, dto: UpdateUnidadesDto): Promise<IUnidade> {
        const unidade = await this.unidadesRepository.findOneBy({ id });
        if (!unidade) {
            throw new Error(`Unidade with id ${id} not found`);
        }
        Object.assign(unidade, dto);
        return this.unidadesRepository.save(unidade);
    }
    async delete(id: string): Promise<void> {
        const unidade = await this.unidadesRepository.findOneBy({ id });
        if (!unidade) {
            throw new NotFoundException(`Unidade with id ${id} not found`);
        }
        await this.unidadesRepository.delete(id);
    }
    async findOne(id: string): Promise<IUnidade> {
        const unidade = await this.unidadesRepository.findOneBy({ id });
        if (!unidade) {
            throw new NotFoundException('Unidade not found');
        }
        await this.unidadesRepository.findOneBy({ id });
        return unidade;
    }
}
