import { Injectable, NotFoundException } from '@nestjs/common';
import { IAula } from './contract/aulas.contract';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Aula } from './entity/aulas.entity';
import { CreateAulaDto } from './dto/create-aulas.dto';
import { UpdateAulaDto } from './dto/update-aulas.dto';
import { v4 as uuidv4 } from 'uuid';
import { Atividades } from '../atividades/entity/atividades.entity';
import { RespostasAlunosMultipla } from '../atividades/entity/respostas-alunos-multipla.entity';
import { ObjetivaRespostas } from '../atividades/entity/objetiva-respostas.entity';
import { ResultadoAlunoAulaDto, RespostaAlunoAtividadeDto } from './dto/query-aulas.dto';
import { MultiplaEscolhaPerguntas } from '../atividades/entity/multipla-escolha-perguntas.entity';
import { ObjetivaPerguntas } from '../atividades/entity/objetiva-perguntas.entity';
import { MultiplaEscolhaGabarito } from '../atividades/entity/multipla-escolha-gabarito.entity';

@Injectable()
export class AulasService {
  constructor(
    @InjectRepository(Aula)
    private readonly aulasRepository: Repository<Aula>,
    @InjectRepository(Atividades)
    private readonly atividadesRepository: Repository<Atividades>,
    @InjectRepository(RespostasAlunosMultipla)
    private readonly respostasAlunosMultiplaRepository: Repository<RespostasAlunosMultipla>,
    @InjectRepository(ObjetivaRespostas)
    private readonly objetivaRespostasRepository: Repository<ObjetivaRespostas>,
    @InjectRepository(MultiplaEscolhaPerguntas)
    private readonly multiplaEscolhaPerguntasRepository: Repository<MultiplaEscolhaPerguntas>,
    @InjectRepository(ObjetivaPerguntas)
    private readonly objetivaPerguntasRepository: Repository<ObjetivaPerguntas>,
    @InjectRepository(MultiplaEscolhaGabarito)
    private readonly multiplaEscolhaGabaritoRepository: Repository<MultiplaEscolhaGabarito>,
  ) {}

  async findAll(): Promise<IAula[]> {
    return this.aulasRepository.find();
  }

  async create(dto: CreateAulaDto, file?: Express.Multer.File): Promise<Aula> {
    const aulaData: Partial<Aula> = {
      ...dto,
    };

    if (file) {
      aulaData.icon_src = `uploads/${file.filename}`;
    }

    const aula = this.aulasRepository.create(aulaData);
    return this.aulasRepository.save(aula);
  }

  async update(id: string, dto: UpdateAulaDto, file?: Express.Multer.File): Promise<IAula> {
    const aula = await this.aulasRepository.findOneBy({ id });
    if (!aula) {
      throw new NotFoundException(`Aula com id ${id} não encontrada`);
    }
    Object.assign(aula, dto);

    if (file) {
      aula.icon_src = `uploads/${file.filename}`;
    }

    return this.aulasRepository.save(aula);
  }

  async delete(id: string): Promise<{ message: string; detalhes: any }> {
    return this.atividadesRepository.manager.transaction(async (manager) => {
      const aula = await manager.findOne(Aula, { where: { id } });
      if (!aula) {
        throw new NotFoundException(`Aula com id ${id} não encontrada`);
      }

      // Log para detalhes da deleção
      const deletionLog: any = {
        id_aula: id,
        respostasMultipla: 0,
        respostasObjetiva: 0,
      };

      // 1. Contar e deletar respostas dos alunos
      const respostasMultipla = await manager.count(RespostasAlunosMultipla, {
        where: { id_atividade: id },
      });
      deletionLog.respostasMultipla = respostasMultipla;
      await manager.delete(RespostasAlunosMultipla, { id_atividade: id });

      const respostasObjetiva = await manager.count(ObjetivaRespostas, {
        where: { id_atividade: id }, // Manter id_atividade para buscar todas as respostas da atividade
      });
      deletionLog.respostasObjetiva = respostasObjetiva;
      await manager.delete(ObjetivaRespostas, { id_atividade: id });

      // 2. Deletar atividades relacionadas
      await manager.delete(Atividades, { aula_id: id });

      // 3. Deletar a aula
      await manager.delete(Aula, id );

      return { message: 'Aula e dados relacionados deletados com sucesso', detalhes: deletionLog };
    });
  }

  async findOne(id: string): Promise<IAula> {
    const aula = await this.aulasRepository.findOneBy({ id });
    if (!aula) {
      throw new NotFoundException('Aula não encontrada');
    }
    return aula;
  }

  async resultadoAlunoAula(aula_id: string, id_aluno: string): Promise<ResultadoAlunoAulaDto[]> {
    const atividades = await this.atividadesRepository.find({ where: { aula_id } });
    if (!atividades.length) return [];

    const resultados: ResultadoAlunoAulaDto[] = [];

    for (const atividade of atividades) {
      // Busca respostas do aluno
      const respostasMultipla = await this.respostasAlunosMultiplaRepository.find({
        where: { id_atividade: atividade.id_atividade, aluno_id: id_aluno },
      });
      const respostasObjetiva = await this.objetivaRespostasRepository.find({
        where: { id_atividade: atividade.id_atividade, aluno_id: id_aluno },
      });

      // Busca totais de perguntas (ajuste se necessário)
      // Aqui supõe-se que você tem como saber quantas perguntas de cada tipo existem na atividade
      // Se não tiver, ajuste para buscar da tabela de perguntas
      const totalMultipla = await this.multiplaEscolhaPerguntasRepository.count({
        where: { id_atividade: atividade.id_atividade },
      });
      const totalAberta = await this.objetivaPerguntasRepository.count({
        where: { id_atividade: atividade.id_atividade },
      });

      // Para contagem correta, ideal é buscar o total de perguntas de cada tipo na atividade
      // Exemplo (ajuste conforme sua modelagem):
      // const totalMultipla = atividade.qtd_perguntas_multipla;
      // const totalAberta = atividade.qtd_perguntas_aberta;

      // Contagem de acertos e feitura
      const acertosMultipla = respostasMultipla.filter(r => r.acerto === '1').length;
      const respondidasAberta = respostasObjetiva.length;

      // Monta respostas detalhadas
      const respostasMultiplaDetalhadas = await Promise.all(
        respostasMultipla.map(async resposta => {
          const gabarito = await this.multiplaEscolhaGabaritoRepository.findOne({
            where: { id_pergunta: resposta.id_pergunta } // ajuste aqui se necessário
          });
          return {
            id_pergunta: resposta.id_pergunta, // ajuste aqui se necessário
            tipo: "multipla" as const,
            resposta: resposta.resposta_aluno,
            acerto: resposta.acerto === '1',
            resposta_correta: gabarito ? gabarito.resposta_correta : null
          };
        })
      );

      const respostasAbertaDetalhadas = respostasObjetiva.map(resposta => ({
        id_pergunta: resposta.id_pergunta, // Agora funcionará corretamente
        tipo: "aberta" as const,
        resposta: resposta.caminho_arquivo
      }));

      resultados.push({
        id_atividade: atividade.id_atividade,
        id_aluno,
        multiplas: {
          total: totalMultipla,
          acertos: acertosMultipla,
          aproveitamento: `${acertosMultipla}/${totalMultipla}`,
          respostas: respostasMultiplaDetalhadas
        },
        abertas: {
          total: totalAberta,
          feitas: respondidasAberta,
          feitura: `${respondidasAberta}/${totalAberta}`,
          respostas: respostasAbertaDetalhadas
        }
      });
    }

    return resultados;
  }
}