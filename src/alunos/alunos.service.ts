import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Aluno } from './entity/alunos.entity';
import { CreateAlunoDto } from './dto/create-alunos.dto';
import { UpdateAlunoDto } from './dto/update-alunos.dto';
import { Auth } from '../auth/entity/auth.entity';
import { UserAccessLevel } from '../auth/entity/user_access_levels.entity';
import * as bcrypt from 'bcrypt';
import { AlunosQueryDto } from './dto/query-alunos.dto';

function cleanCpf(cpf: string): string {
  return cpf.replace(/[^\d]/g, '');
}

function formatNascimento(data: string): string {
  // data no formato 'YYYY-MM-DD'
  const [ano, mes, dia] = data.split('-');
  return `${dia}${mes}${ano}`;
}

@Injectable()
export class AlunosService {
  constructor(
    @InjectRepository(Aluno)
    private readonly alunosRepository: Repository<Aluno>,
    @InjectRepository(Auth)
    private readonly usersRepository: Repository<Auth>,
    @InjectRepository(UserAccessLevel)
    private readonly userAccessLevelRepo: Repository<UserAccessLevel>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query?: AlunosQueryDto): Promise<any[]> {
    const qb = this.alunosRepository
      .createQueryBuilder('aluno')
      .select([
        'aluno.id',
        'aluno.nome',
        'aluno.cpf',
        'aluno.data_nascimento',
        'aluno.empresa_id',
        'aluno.unidade_id',
        'aluno.turma_id',
      ]);

    if (query?.unidade_id) {
      qb.andWhere('aluno.unidade_id = :unidade_id', { unidade_id: query.unidade_id });
    }
    if (query?.turma_id) {
      qb.andWhere('aluno.turma_id = :turma_id', { turma_id: query.turma_id });
    }


    return qb.getMany();
  }

  async findOne(id: string): Promise<any> {
    // Busca individual: todos os dados, sem username
    const aluno = await this.alunosRepository
      .createQueryBuilder('aluno')
      .select([
        'aluno.id',
        'aluno.nome',
        'aluno.cpf',
        'aluno.data_nascimento',
        'aluno.unidade_id',
        'aluno.turma_id',
        'aluno.empresa_id',
        'aluno.criado_em',
        'aluno.atualizado_em',
        'aluno.responsavel_nome',
        'aluno.sexo',
        'aluno.rg',
        'aluno.endereco',
        'aluno.numero',
        'aluno.complemento',
        'aluno.bairro',
        'aluno.cidade',
        'aluno.cep',
        'aluno.celular',
        'aluno.celular_recado',
        'aluno.email',
        'aluno.escola',
        'aluno.serie',
        'aluno.periodo',
      ])
      .where('aluno.id = :id', { id })
      .getRawOne();

    if (!aluno) {
      throw new NotFoundException('Aluno não encontrado');
    }
    return aluno;
  }

  async create(dto: CreateAlunoDto): Promise<any> {
    const username = cleanCpf(dto.cpf);
    const senhaLimpa = formatNascimento(dto.data_nascimento);
    const password_hash = await bcrypt.hash(senhaLimpa, 10);

    return await this.dataSource.transaction(async manager => {
      const aluno = manager.create(Aluno, { ...dto });
      await manager.save(Aluno, aluno);

      const user = manager.create(Auth, {
        uuid: aluno.id,
        name: dto.nome,
        username,
        password_hash,
        role_id: 1,
      });
      await manager.save(Auth, user);

      const access = manager.create(UserAccessLevel, {
        user_uuid: aluno.id,
        access_level_id: 1,
      });
      await manager.save(UserAccessLevel, access);

      // Não retorna username
      return aluno;
    });
  }

  async update(id: string, dto: UpdateAlunoDto): Promise<any> {
    const aluno = await this.alunosRepository.findOneBy({ id });
    if (!aluno) throw new NotFoundException(`Aluno com id ${id} não encontrado`);

    Object.assign(aluno, dto);

    const user = await this.usersRepository.findOneBy({ uuid: id });
    if (!user) throw new NotFoundException(`Usuário vinculado ao aluno não encontrado`);

    if (dto.nome) user.name = dto.nome;
    if (dto.cpf) user.username = cleanCpf(dto.cpf);
    if (dto.data_nascimento)
      user.password_hash = await bcrypt.hash(formatNascimento(dto.data_nascimento), 10);

    await this.alunosRepository.save(aluno);
    await this.usersRepository.save(user);

    // Retorna todas as informações do aluno (igual ao findOne), sem username
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.alunosRepository.delete(id);
    await this.usersRepository.delete(id);
    await this.userAccessLevelRepo.delete({ user_uuid: id });
  }
}
