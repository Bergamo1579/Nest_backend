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
import { AlunoAulaPresence} from './entity/aluno_aula_presence.entity';
import { CreateAlunoAulaPresenceDto } from './dto/create-aluno-aula-presence.dto';
import { JwtService } from '@nestjs/jwt';
import { InstrutoresService } from '../instrutores/instrutores.service'; // ajuste o caminho se necessário
import { LoginTemporarioDto } from '../instrutores/dto/acessos.dto';
import { FaltasResponseDto } from './dto/faltas-response.dto';

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
    private readonly instrutoresService: InstrutoresService,
    private readonly jwtService: JwtService,
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
    if (query?.empresa_id) {
      qb.andWhere('aluno.empresa_id = :empresa_id', { empresa_id: query.empresa_id });
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

  async criarPresence(dto: CreateAlunoAulaPresenceDto) {
    return await this.dataSource.transaction(async manager => {
      const presence = manager.create(AlunoAulaPresence, { ...dto });
      return manager.save(AlunoAulaPresence, presence);
    });
  }

  async acessarAula(dto: LoginTemporarioDto, reqUser: any) {
    // Valida o acesso temporário (já faz a checagem da senha)
    const user = await this.instrutoresService.validarAcessoTemporario(dto, reqUser);

    if (user && process.env.ACESS_AULA) {
      const payload = {
        sub: user.aluno_id,
        aluno_id: user.aluno_id,
        aula_id: dto.aula_id,
        type: 'acesso_aula',
      };
      const token = this.jwtService.sign(payload, {
        secret: process.env.ACESS_AULA,
        expiresIn: '1h',
      });

      return {
        message: 'Acesso temporário validado',
        token: `Bearer ${token}`,
        user: payload,
      };
    }

    // Se não validar, retorna só a mensagem (ou lance um erro se preferir)
    return { message: 'Acesso temporário inválido' };
  }

  async criarPresenceFromToken(token: string) {
    // Remove "Bearer " se vier assim
    if (token.startsWith('Bearer ')) {
      token = token.slice(7);
    }

    // Decodifica e valida o token
    let payload: any;
    try {
      payload = this.jwtService.verify(token, { secret: process.env.ACESS_AULA });
    } catch (e) {
      throw new Error('Token inválido ou expirado');
    }

    // Extrai os dados do payload
    const aluno_id = payload.aluno_id;
    const aula_id = payload.aula_id;

    if (!aluno_id || !aula_id) {
      throw new Error('Token não contém aluno_id ou aula_id');
    }

    // Salva a presença normalmente
    return await this.dataSource.transaction(async manager => {
      const presence = manager.create(AlunoAulaPresence, { aluno_id, aula_id });
      return manager.save(AlunoAulaPresence, presence);
    });
  }

  async listarFaltas(aluno_id: string, data_inicio: string, data_fim: string): Promise<FaltasResponseDto> {
    console.log('=== listarFaltas called ===');
    console.log('raw params:', { aluno_id, data_inicio, data_fim });

    const start = (data_inicio || '').split('T')[0];
    const end = (data_fim || '').split('T')[0];

    // Use full-day range to avoid time issues
    const startDateTime = `${start} 00:00:00`;
    const endDateTime = `${end} 23:59:59`;

    const result = await this.dataSource.query(
      `
      SELECT 
        ta.aula_id,
        au.titulo AS nome_aula,
        ta.data_aula,
        CASE WHEN p.id IS NULL THEN 0 ELSE 1 END AS presenca
      FROM turma_aula ta
      JOIN alunos a 
        ON a.turma_id = ta.turma_id
      JOIN aulas au 
        ON au.id = ta.aula_id
      LEFT JOIN presence p 
        ON p.aula_id = ta.aula_id 
       AND p.aluno_id = a.id
      WHERE a.id = ?
        AND ta.data_aula BETWEEN ? AND ?
      ORDER BY ta.data_aula
      `,
      [aluno_id, startDateTime, endDateTime]
    ) as FaltaQueryResult[];

    console.log('query params used:', { aluno_id, startDateTime, endDateTime });
    console.log('query rows count:', result.length, 'rows:', result.map(r => ({ aula_id: r.aula_id, data_aula: r.data_aula, presenca: r.presenca })));

    const totalAulas = result.length;
    const totalPresencas = result.filter((r: FaltaQueryResult) => r.presenca == 1).length;
    const totalFaltas = result.filter((r: FaltaQueryResult) => r.presenca == 0).length;
    const faltas = result
      .filter((r: FaltaQueryResult) => r.presenca == 0)
      .map((r: FaltaQueryResult) => ({
        aula_id: r.aula_id,
        nome_aula: r.nome_aula,
        data_aula: r.data_aula,
      }));

    return {
      total_aulas: totalAulas,
      total_presencas: totalPresencas,
      total_faltas: totalFaltas,
      faltas,
    };
  }
}

interface FaltaQueryResult {
  aula_id: string;
  nome_aula: string;
  data_aula: string;
  presenca: number;
}
