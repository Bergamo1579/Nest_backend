import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Empresa } from './entity/empresas.entity';
import { CreateEmpresaDto } from './dto/create-empresas.dto';
import { UpdateEmpresaDto } from './dto/update-empresas.dto';
import { Auth } from '../auth/entity/auth.entity';
import { UserAccessLevel } from '../auth/entity/user_access_levels.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmpresasService {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresasRepository: Repository<Empresa>,
    @InjectRepository(Auth)
    private readonly usersRepository: Repository<Auth>,
    @InjectRepository(UserAccessLevel)
    private readonly userAccessLevelRepo: Repository<UserAccessLevel>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<any[]> {
    // Busca geral: só dados básicos
    return this.empresasRepository
      .createQueryBuilder('empresa')
      .leftJoinAndSelect(Auth, 'user', 'user.uuid = empresa.id')
      .select([
        'empresa.id',
        'empresa.nome',
        'empresa.criado_em',
        'user.username',
      ])
      .getRawMany();
  }

  async findOne(id: string): Promise<any> {
    // Busca individual: todos os dados, menos senha
    const empresa = await this.empresasRepository
      .createQueryBuilder('empresa')
      .leftJoinAndSelect(Auth, 'user', 'user.uuid = empresa.id')
      .select([
        'empresa.id',
        'empresa.nome',
        'empresa.criado_em',
        'empresa.razao_social',
        'empresa.cnpj',
        'empresa.inscricao_estadual',
        'empresa.endereco',
        'empresa.numero',
        'empresa.cidade',
        'empresa.bairro',
        'empresa.estado',
        'empresa.cep',
        'empresa.telefone',
        'empresa.email',
        'empresa.representante_nome',
        'empresa.representante_cargo',
        'user.username',
        // NÃO selecione password_hash!
      ])
      .where('empresa.id = :id', { id })
      .getRawOne();

    if (!empresa) {
      throw new NotFoundException('Empresa não encontrada');
    }
    return empresa;
  }

  async create(dto: CreateEmpresaDto): Promise<any> {
    const password_hash = await bcrypt.hash(dto.password, 10);

    return await this.dataSource.transaction(async manager => {
      // Cria empresa
      const empresa = manager.create(Empresa, {
        nome: dto.nome,
        razao_social: dto.razao_social,
        cnpj: dto.cnpj,
        inscricao_estadual: dto.inscricao_estadual,
        endereco: dto.endereco,
        numero: dto.numero,
        cidade: dto.cidade,
        bairro: dto.bairro,
        estado: dto.estado,
        cep: dto.cep,
        telefone: dto.telefone,
        email: dto.email,
        representante_nome: dto.representante_nome,
        representante_cargo: dto.representante_cargo,
      });
      await manager.save(Empresa, empresa);

      // Cria usuário
      const user = manager.create(Auth, {
        uuid: empresa.id,
        name: dto.nome,
        username: dto.username,
        password_hash,
        role_id: 3,
      });
      await manager.save(Auth, user);

      // Cria user_access_levels
      const access = manager.create(UserAccessLevel, {
        user_uuid: empresa.id,
        access_level_id: 2,
      });
      await manager.save(UserAccessLevel, access);

      return {
        ...empresa,
        username: user.username,
      };
    });
  }

  async update(id: string, dto: UpdateEmpresaDto): Promise<any> {
    const empresa = await this.empresasRepository.findOneBy({ id });
    if (!empresa) {
      throw new NotFoundException(`Empresa com id ${id} não encontrada`);
    }

    Object.assign(empresa, dto);

    const user = await this.usersRepository.findOneBy({ uuid: id });
    if (!user) {
      throw new NotFoundException(`Usuário vinculado à empresa não encontrado`);
    }
    user.name = dto.nome ?? user.name;
    if (dto.username) user.username = dto.username;
    if (dto.password) user.password_hash = await bcrypt.hash(dto.password, 10);

    await this.empresasRepository.save(empresa);
    await this.usersRepository.save(user);

    // Retorna todas as informações completas da empresa após o update
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.empresasRepository.delete(id);
    await this.usersRepository.delete(id);
    await this.userAccessLevelRepo.delete({ user_uuid: id });
  }
}
