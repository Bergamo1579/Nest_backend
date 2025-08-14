import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Instrutor } from './entity/instrutores.entity';
import { CreateInstrutorDto } from './dto/create-instrutores.dto';
import { UpdateInstrutorDto } from './dto/update-instrutores.dto';
import { Auth } from '../auth/entity/auth.entity';
import { UserAccessLevel } from '../auth/entity/user_access_levels.entity';
import * as bcrypt from 'bcrypt';
import { AcessosTemporarios } from './entity/acessos_entity.entity';
import { CreateAcessoTemporarioDto, LoginTemporarioDto, AcessoTemporarioResponseDto } from './dto/acessos.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InstrutoresService {
  constructor(
    @InjectRepository(Instrutor)
    private readonly instrutoresRepository: Repository<Instrutor>,
    @InjectRepository(Auth)
    private readonly usersRepository: Repository<Auth>,
    @InjectRepository(UserAccessLevel)
    private readonly userAccessLevelRepo: Repository<UserAccessLevel>,
    private readonly dataSource: DataSource,
    @InjectRepository(AcessosTemporarios)
    private readonly repo: Repository<AcessosTemporarios>,
  ) {}

  async findAll(): Promise<any[]> {
    return this.instrutoresRepository
      .createQueryBuilder('instrutor')
      .leftJoinAndSelect(Auth, 'user', 'user.uuid = instrutor.id')
      .select([
        'instrutor.id',
        'instrutor.nome',
        'instrutor.description',
        'instrutor.id_unidade',
        'user.username',
      ])
      .getRawMany();
  }

  async findOne(id: string): Promise<any> {
    const instrutor = await this.instrutoresRepository
      .createQueryBuilder('instrutor')
      .leftJoinAndSelect(Auth, 'user', 'user.uuid = instrutor.id')
      .select([
        'instrutor.id',
        'instrutor.nome',
        'instrutor.description',
        'instrutor.id_unidade',
        'user.username',
      ])
      .where('instrutor.id = :id', { id })
      .getRawOne();

    if (!instrutor) {
      throw new NotFoundException('Instrutor não encontrado');
    }
    return instrutor;
  }

  async create(dto: CreateInstrutorDto): Promise<any> {
    const password_hash = await bcrypt.hash(dto.password, 10);

    return await this.dataSource.transaction(async manager => {
      // Cria instrutor
      const instrutor = manager.create(Instrutor, {
        nome: dto.nome,
        description: dto.description,
        id_unidade: dto.id_unidade,
      });
      await manager.save(Instrutor, instrutor);

      // Cria usuário
      const user = manager.create(Auth, {
        uuid: instrutor.id,
        name: dto.nome,
        username: dto.username,
        password_hash,
        role_id: 3,
      });
      await manager.save(Auth, user);

      // Cria user_access_levels
      const access = manager.create(UserAccessLevel, {
        user_uuid: instrutor.id,
        access_level_id: 2,
      });
      await manager.save(UserAccessLevel, access);

      return {
        id: instrutor.id,
        nome: instrutor.nome,
        description: instrutor.description,
        id_unidade: instrutor.id_unidade,
        username: user.username,
      };
    });
  }

  async update(id: string, dto: UpdateInstrutorDto): Promise<any> {
    const instrutor = await this.instrutoresRepository.findOneBy({ id });
    if (!instrutor) {
      throw new NotFoundException(`Instrutor com id ${id} não encontrado`);
    }

    Object.assign(instrutor, dto);

    const user = await this.usersRepository.findOneBy({ uuid: id });
    if (!user) {
      throw new NotFoundException(`Usuário vinculado ao instrutor não encontrado`);
    }
    user.name = dto.nome ?? user.name;
    if (dto.username) user.username = dto.username;
    if (dto.password) user.password_hash = await bcrypt.hash(dto.password, 10);

    await this.instrutoresRepository.save(instrutor);
    await this.usersRepository.save(user);

    return {
      id: instrutor.id,
      nome: instrutor.nome,
      description: instrutor.description,
      id_unidade: instrutor.id_unidade,
      username: user.username,
    };
  }

  async delete(id: string): Promise<void> {
    await this.instrutoresRepository.delete(id);
    await this.usersRepository.delete(id);
    await this.userAccessLevelRepo.delete({ user_uuid: id });
  }

  async createAcessoTemporario(
    dto: CreateAcessoTemporarioDto,
    user: any,
  ): Promise<AcessosTemporarios> {
    console.log('Payload do Bearer recebido:', user);

    if (!user || user.role !== 'Instrutor') {
      throw new UnauthorizedException('Apenas instrutores podem criar acessos temporários');
    }
    const hash = await bcrypt.hash(dto.temp_password, 10);
    const acesso = this.repo.create({
      id: uuidv4(),
      aluno_id: dto.aluno_id,
      aula_id: dto.aula_id,
      instrutor_id: user.userId,
      temp_password: hash,
      criado_em: new Date(),
    });
    return this.repo.save(acesso);
  }

  async validarAcessoTemporario(
    dto: LoginTemporarioDto,
    user: any,
  ): Promise<AcessoTemporarioResponseDto> {
    if (!user || user.role !== 'Aluno') {
      throw new UnauthorizedException('Apenas alunos podem validar acesso temporário');
    }

    // Pegue o id do aluno do JWT (ajuste conforme seu payload, ex: user.userId)
    const alunoId = user.userId;

    // Busque pelo aluno_id do JWT e aula_id do body
    const acesso = await this.repo.findOne({
      where: { aluno_id: alunoId, aula_id: dto.aula_id },
    });

    if (!acesso) {
      throw new NotFoundException('Acesso temporário não encontrado para este aluno e aula');
    }

    // Verifique se passou mais de 2 minutos
    const criadoEm = acesso.criado_em instanceof Date ? acesso.criado_em : new Date(acesso.criado_em);
    const agora = new Date();
    const diffMs = agora.getTime() - criadoEm.getTime();
    if (diffMs > 2 * 60 * 1000) {
      throw new UnauthorizedException('Acesso temporário expirado');
    }

    // Verifique a senha
    const senhaOk = await bcrypt.compare(dto.temp_password, acesso.temp_password);
    if (!senhaOk) {
      throw new UnauthorizedException('Senha temporária inválida');
    }

    return {
      id: acesso.id,
      aluno_id: acesso.aluno_id,
      aula_id: acesso.aula_id,
      criado_em: acesso.criado_em,
    };
  }
}
