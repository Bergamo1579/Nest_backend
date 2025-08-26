import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Atividades } from './entity/atividades.entity';
import { MultiplaEscolhaPerguntas } from './entity/multipla-escolha-perguntas.entity';
import { MultiplaEscolhaRespostas } from './entity/multipla-escolha-respostas.entity';
import { MultiplaEscolhaGabarito } from './entity/multipla-escolha-gabarito.entity';
import { ObjetivaPerguntas } from './entity/objetiva-perguntas.entity';
import { RespostasAlunosMultipla } from './entity/respostas-alunos-multipla.entity';
import { ObjetivaRespostas } from './entity/objetiva-respostas.entity';
import { CreateAtividadesDto } from './dto/create-atividades.dto';
import { ResponderMultiplaEscolhaDto, ResponderAtividadeCompletaDto, ResponderMultiplaEscolhaPerguntaDto, ResponderAbertaPerguntaDto } from './dto/responder-atividade.dto';
import { UpdateAtividadesDto } from './dto/update-atividades.dto';
import { Aula } from '../aulas/entity/aulas.entity';

@Injectable()
export class AtividadesService {
  constructor(
    @InjectRepository(Atividades)
    private readonly atividadesRepository: Repository<Atividades>,
    @InjectRepository(MultiplaEscolhaPerguntas)
    private readonly multiplaEscolhaPerguntasRepository: Repository<MultiplaEscolhaPerguntas>,
    @InjectRepository(MultiplaEscolhaRespostas)
    private readonly multiplaEscolhaRespostasRepository: Repository<MultiplaEscolhaRespostas>,
    @InjectRepository(MultiplaEscolhaGabarito)
    private readonly multiplaEscolhaGabaritoRepository: Repository<MultiplaEscolhaGabarito>,
    @InjectRepository(ObjetivaPerguntas)
    private readonly objetivaPerguntasRepository: Repository<ObjetivaPerguntas>,
    @InjectRepository(RespostasAlunosMultipla)
    private readonly respostasAlunosMultiplaRepository: Repository<RespostasAlunosMultipla>,
    @InjectRepository(ObjetivaRespostas)
    private readonly objetivaRespostasRepository: Repository<ObjetivaRespostas>,
    @InjectRepository(Aula)
    private readonly aulaRepository: Repository<Aula>,
  ) {}

  async create(dto: CreateAtividadesDto): Promise<Atividades> {
    return this.atividadesRepository.manager.transaction(async (manager) => {
      const atividadeId = uuidv4();
      
      // Mapear tipo para ID - se for mista, usar ID da múltipla escolha como padrão
      let tipoAtividadeId: string;
      if (dto.tipo_atividade === 'multipla' || dto.tipo_atividade === 'mista') {
        tipoAtividadeId = '1'; // ID da múltipla escolha
      } else {
        tipoAtividadeId = '2'; // ID da objetiva
      }
      
      const atividade = manager.create(Atividades, {
        id_atividade: atividadeId,
        aula_id: dto.aula_id,
        titulo: dto.titulo,
        id_tipo_atividade: tipoAtividadeId,
      });

      await manager.save(atividade);

      // Processar perguntas de múltipla escolha (se existirem)
      if (dto.perguntas_multipla && dto.perguntas_multipla.length > 0) {
        for (const perguntaDto of dto.perguntas_multipla) {
          const perguntaId = uuidv4();
          
          const pergunta = manager.create(MultiplaEscolhaPerguntas, {
            id_pergunta: perguntaId,
            id_atividade: atividadeId,
            numero_questao: perguntaDto.numero_questao,
            texto_pergunta: perguntaDto.texto_pergunta,
          });

          await manager.save(pergunta);

          // Preparar as alternativas
          const alternativas: any = {
            id_resposta: uuidv4(),
            id_pergunta: perguntaId,
            alternativa_a: null,
            alternativa_b: null,
            alternativa_c: null,
            alternativa_d: null,
            alternativa_e: null,
          };

          // Preencher as alternativas baseado no array de respostas
          for (const respostaDto of perguntaDto.respostas) {
            const opcao = respostaDto.opcao.toLowerCase();
            switch (opcao) {
              case 'a':
                alternativas.alternativa_a = respostaDto.texto_resposta;
                break;
              case 'b':
                alternativas.alternativa_b = respostaDto.texto_resposta;
                break;
              case 'c':
                alternativas.alternativa_c = respostaDto.texto_resposta;
                break;
              case 'd':
                alternativas.alternativa_d = respostaDto.texto_resposta;
                break;
              case 'e':
                alternativas.alternativa_e = respostaDto.texto_resposta;
                break;
            }
          }

          // Salvar as alternativas
          const respostas = manager.create(MultiplaEscolhaRespostas, alternativas);
          await manager.save(respostas);

          // Salvar gabarito
          const gabarito = manager.create(MultiplaEscolhaGabarito, {
            id_gabarito: uuidv4(),
            id_pergunta: perguntaId,
            resposta_correta: perguntaDto.resposta_correta,
          });
          await manager.save(gabarito);
        }
      }

      // Processar perguntas objetivas/abertas (se existirem)
      if (dto.perguntas_objetiva && dto.perguntas_objetiva.length > 0) {
        for (const perguntaDto of dto.perguntas_objetiva) {
          const pergunta = manager.create(ObjetivaPerguntas, {
            id_pergunta: uuidv4(),
            id_atividade: atividadeId,
            texto_questao: perguntaDto.texto_questao,
          });
          await manager.save(pergunta);
        }
      }

      // Buscar a atividade criada com os relacionamentos
      const atividadeRepo = manager.getRepository(Atividades);
      const atividadeCriada = await atividadeRepo.findOne({
        where: { id_atividade: atividadeId },
        relations: [
          'perguntasMultipla',
          'perguntasMultipla.respostas',
          'perguntasMultipla.gabarito',
          'perguntasObjetiva'
        ]
      });

      // Verificar se a atividade foi encontrada
      if (!atividadeCriada) {
        throw new NotFoundException('Erro ao buscar atividade criada');
      }

      return atividadeCriada;
    });
  }

  async findAll(aulaId?: string): Promise<Atividades[]> {
    if (aulaId) {
      const aula = await this.aulaRepository.findOne({ where: { id: aulaId } });
      if (!aula) {
        throw new NotFoundException('Aula não encontrada');
      }
    }

    const query = this.atividadesRepository
      .createQueryBuilder('atividade');

    if (aulaId) {
      query.where('atividade.aula_id = :aulaId', { aulaId });
    }

    // Não faz join com perguntas, retorna só os campos da atividade
    return query.getMany();
  }

  async findOne(id: string): Promise<Atividades> {
    const atividade = await this.atividadesRepository.findOne({
      where: { id_atividade: id },
      relations: [
        'perguntasMultipla',
        'perguntasMultipla.respostas',
        'perguntasMultipla.gabarito',
        'perguntasObjetiva'
      ]
    });

    if (!atividade) {
      throw new NotFoundException('Atividade não encontrada');
    }

    // Montar uma cópia limpa para resposta, sem o campo gabarito
    const atividadeLimpa: any = {
      ...atividade,
      perguntasMultipla: atividade.perguntasMultipla?.map(pergunta => {
        // Remove o campo gabarito
        const { gabarito, ...perguntaSemGabarito } = pergunta;
        return perguntaSemGabarito;
      }),
    };

    return atividadeLimpa;
  }

  async responderMultiplaEscolha(
    atividadeId: string,
    alunoId: string,
    dto: ResponderMultiplaEscolhaDto
  ): Promise<any> {
    const atividade = await this.findOne(atividadeId);
    
    if (atividade.id_tipo_atividade !== 'MULTIPLA') {
      throw new BadRequestException('Esta atividade não é de múltipla escolha');
    }

    // Verificar se já respondeu
    const perguntas = await this.multiplaEscolhaPerguntasRepository.find({ where: { id_atividade: atividadeId } });
    for (const pergunta of perguntas) {
      const jaRespondeu = await this.respostasAlunosMultiplaRepository.findOne({
        where: { id_pergunta: pergunta.id_pergunta, aluno_id: alunoId }
      });
      if (jaRespondeu) {
        throw new BadRequestException('Aluno já respondeu esta atividade');
      }
    }

    // Calcular acertos
    const gabaritos = await this.multiplaEscolhaGabaritoRepository
      .createQueryBuilder('gabarito')
      .innerJoin('gabarito.pergunta', 'pergunta')
      .where('pergunta.id_atividade = :atividadeId', { atividadeId })
      .orderBy('pergunta.numero_questao', 'ASC')
      .getMany();

    let acertos = 0;
    for (let i = 0; i < gabaritos.length; i++) {
      const acerto = dto.respostas[i] === gabaritos[i].resposta_correta ? '1' : '0';

      const resposta = this.respostasAlunosMultiplaRepository.create({
        id_resposta: uuidv4(),
        id_pergunta: gabaritos[i].id_pergunta,
        id_atividade: atividadeId,
        aluno_id: alunoId,
        acerto: acerto,
        resposta_aluno: dto.respostas[i],
        data_feitura: new Date(),
      });

      await this.respostasAlunosMultiplaRepository.save(resposta);
    }

    return {
      acertos: `${acertos}/${gabaritos.length}`,
      porcentagem: Math.round((acertos / gabaritos.length) * 100),
      respostas: dto.respostas,
    };
  }

  async responderObjetiva(
    atividadeId: string,
    alunoId: string,
    dto: ResponderAbertaPerguntaDto  // CORRIGIDO: Use ResponderAbertaPerguntaDto
  ): Promise<ObjetivaRespostas> {
    const atividade = await this.findOne(atividadeId);
    
    if (atividade.id_tipo_atividade !== 'OBJETIVA') {
      throw new BadRequestException('Esta atividade não é objetiva');
    }

    const resposta = this.objetivaRespostasRepository.create({
      id_resposta: uuidv4(),
      id_atividade: atividadeId,
      aluno_id: alunoId,
      caminho_arquivo: dto.caminho_arquivo,
      data_envio: new Date(),
    });

    return this.objetivaRespostasRepository.save(resposta);
  }

  async delete(id: string): Promise<{ message: string; detalhes: any }> {
    return this.atividadesRepository.manager.transaction(async (manager) => {
      // Verificar se a atividade existe
      const atividade = await manager.findOne(Atividades, { 
        where: { id_atividade: id } 
      });
      
      if (!atividade) {
        throw new NotFoundException('Atividade não encontrada');
      }

      const deletionLog = {
        respostasMultipla: 0,
        respostasObjetiva: 0,
        gabaritos: 0,
        alternativas: 0,
        perguntasMultipla: 0,
        perguntasObjetiva: 0
      };

      try {
        // 1. Contar e deletar respostas dos alunos
        const perguntasMultiplaDelete = await manager.find(MultiplaEscolhaPerguntas, { where: { id_atividade: id } });
        let totalRespostasMultipla = 0;
        for (const pergunta of perguntasMultiplaDelete) {
          const count = await manager.count(RespostasAlunosMultipla, { where: { id_pergunta: pergunta.id_pergunta } });
          totalRespostasMultipla += count;
          await manager.delete(RespostasAlunosMultipla, { id_pergunta: pergunta.id_pergunta });
        }
        deletionLog.respostasMultipla = totalRespostasMultipla;

        const respostasObjetiva = await manager.count(ObjetivaRespostas, { 
          where: { id_atividade: id } 
        });
        deletionLog.respostasObjetiva = respostasObjetiva;
        await manager.delete(ObjetivaRespostas, { id_atividade: id });

        // 2. Processar perguntas de múltipla escolha
        const perguntasMultipla = await manager.find(MultiplaEscolhaPerguntas, {
          where: { id_atividade: id }
        });

        deletionLog.perguntasMultipla = perguntasMultipla.length;

        for (const pergunta of perguntasMultipla) {
          // Deletar gabaritos
          const gabaritos = await manager.count(MultiplaEscolhaGabarito, { 
            where: { id_pergunta: pergunta.id_pergunta } 
          });
          deletionLog.gabaritos += gabaritos;
          await manager.delete(MultiplaEscolhaGabarito, { id_pergunta: pergunta.id_pergunta });
          
          // Deletar alternativas
          const alternativas = await manager.count(MultiplaEscolhaRespostas, { 
            where: { id_pergunta: pergunta.id_pergunta } 
          });
          deletionLog.alternativas += alternativas;
          await manager.delete(MultiplaEscolhaRespostas, { id_pergunta: pergunta.id_pergunta });
        }

        // 3. Deletar perguntas
        await manager.delete(MultiplaEscolhaPerguntas, { id_atividade: id });

        const perguntasObjetiva = await manager.count(ObjetivaPerguntas, { 
          where: { id_atividade: id } 
        });
        deletionLog.perguntasObjetiva = perguntasObjetiva;
        await manager.delete(ObjetivaPerguntas, { id_atividade: id });

        // 4. Deletar atividade principal
        await manager.delete(Atividades, { id_atividade: id });

        return {
          message: 'Atividade e todos os dados relacionados foram deletados com sucesso',
          detalhes: deletionLog
        };

      } catch (error) {
        console.error('Erro durante a exclusão:', error);
        throw new BadRequestException(`Erro ao deletar atividade: ${error.message}`);
      }
    });
  }

  async update(id: string, dto: UpdateAtividadesDto): Promise<Atividades> {
    return this.atividadesRepository.manager.transaction(async (manager) => {
      // Verificar se a atividade existe
      const atividadeExistente = await manager.findOne(Atividades, { 
        where: { id_atividade: id } 
      });
      
      if (!atividadeExistente) {
        throw new NotFoundException('Atividade não encontrada');
      }

      // Verificar se há respostas de alunos (impedir edição se já foi respondida)
      const perguntasMultipla = await manager.find(MultiplaEscolhaPerguntas, { where: { id_atividade: id } });
      let temRespostasMultipla = 0;
      for (const pergunta of perguntasMultipla) {
        temRespostasMultipla += await manager.count(RespostasAlunosMultipla, { where: { id_pergunta: pergunta.id_pergunta } });
      }
      
      const temRespostasObjetiva = await manager.count(ObjetivaRespostas, { 
        where: { id_atividade: id } 
      });

      if (temRespostasMultipla > 0 || temRespostasObjetiva > 0) {
        throw new BadRequestException('Não é possível editar uma atividade que já possui respostas de alunos');
      }

      try {
        // 1. Atualizar dados básicos da atividade (se fornecidos)
        if (dto.titulo || dto.tipo_atividade) {
          const updateData: any = {};
          
          if (dto.titulo) {
            updateData.titulo = dto.titulo;
          }
          
          if (dto.tipo_atividade) {
            // Mapear tipo para ID
            if (dto.tipo_atividade === 'multipla' || dto.tipo_atividade === 'mista') {
              updateData.id_tipo_atividade = '1';
            } else {
              updateData.id_tipo_atividade = '2';
            }
          }

          await manager.update(Atividades, { id_atividade: id }, updateData);
        }

        // 2. Se tem novas perguntas, remover as antigas e criar as novas
        if (dto.perguntas_multipla !== undefined || dto.perguntas_objetiva !== undefined) {
          
          // Remover perguntas e dados relacionados existentes
          await this.removerPerguntasExistentes(manager, id);

          // 3. Recriar perguntas de múltipla escolha (se fornecidas)
          if (dto.perguntas_multipla && dto.perguntas_multipla.length > 0) {
            await this.criarPerguntasMultipla(manager, id, dto.perguntas_multipla);
          }

          // 4. Recriar perguntas objetivas (se fornecidas)
          if (dto.perguntas_objetiva && dto.perguntas_objetiva.length > 0) {
            await this.criarPerguntasObjetiva(manager, id, dto.perguntas_objetiva);
          }
        }

        // Buscar a atividade atualizada com os relacionamentos
        const atividadeAtualizada = await manager.findOne(Atividades, {
          where: { id_atividade: id },
          relations: [
            'perguntasMultipla',
            'perguntasMultipla.respostas',
            'perguntasMultipla.gabarito',
            'perguntasObjetiva'
          ]
        });

        if (!atividadeAtualizada) {
          throw new NotFoundException('Erro ao buscar atividade atualizada');
        }

        return atividadeAtualizada;

      } catch (error) {
        console.error('Erro durante a atualização:', error);
        throw new BadRequestException(`Erro ao atualizar atividade: ${error.message}`);
      }
    });
  }

  // Método auxiliar para remover perguntas existentes
  private async removerPerguntasExistentes(manager: any, atividadeId: string): Promise<void> {
    // Buscar perguntas de múltipla escolha para deletar gabaritos e alternativas
    const perguntasMultipla = await manager.find(MultiplaEscolhaPerguntas, {
      where: { id_atividade: atividadeId }
    });

    for (const pergunta of perguntasMultipla) {
      // Deletar gabaritos
      await manager.delete(MultiplaEscolhaGabarito, { id_pergunta: pergunta.id_pergunta });
      
      // Deletar alternativas/respostas
      await manager.delete(MultiplaEscolhaRespostas, { id_pergunta: pergunta.id_pergunta });
    }

    // Deletar perguntas de múltipla escolha
    await manager.delete(MultiplaEscolhaPerguntas, { id_atividade: atividadeId });

    // Deletar perguntas objetivas
    await manager.delete(ObjetivaPerguntas, { id_atividade: atividadeId });
  }

  // Método auxiliar para criar perguntas de múltipla escolha
  private async criarPerguntasMultipla(manager: any, atividadeId: string, perguntas: any[]): Promise<void> {
    for (const perguntaDto of perguntas) {
      const perguntaId = uuidv4();
      
      const pergunta = manager.create(MultiplaEscolhaPerguntas, {
        id_pergunta: perguntaId,
        id_atividade: atividadeId,
        numero_questao: perguntaDto.numero_questao,
        texto_pergunta: perguntaDto.texto_pergunta,
      });

      await manager.save(pergunta);

      // Preparar as alternativas
      const alternativas: any = {
        id_resposta: uuidv4(),
        id_pergunta: perguntaId,
        alternativa_a: null,
        alternativa_b: null,
        alternativa_c: null,
        alternativa_d: null,
        alternativa_e: null,
      };

      // Preencher as alternativas
      for (const respostaDto of perguntaDto.respostas) {
        const opcao = respostaDto.opcao.toLowerCase();
        switch (opcao) {
          case 'a':
            alternativas.alternativa_a = respostaDto.texto_resposta;
            break;
          case 'b':
            alternativas.alternativa_b = respostaDto.texto_resposta;
            break;
          case 'c':
            alternativas.alternativa_c = respostaDto.texto_resposta;
            break;
          case 'd':
            alternativas.alternativa_d = respostaDto.texto_resposta;
            break;
          case 'e':
            alternativas.alternativa_e = respostaDto.texto_resposta;
            break;
        }
      }

      // Salvar as alternativas
      const respostas = manager.create(MultiplaEscolhaRespostas, alternativas);
      await manager.save(respostas);

      // Salvar gabarito
      const gabarito = manager.create(MultiplaEscolhaGabarito, {
        id_gabarito: uuidv4(),
        id_pergunta: perguntaId,
        resposta_correta: perguntaDto.resposta_correta,
      });
      await manager.save(gabarito);
    }
  }

  // Método auxiliar para criar perguntas objetivas
  private async criarPerguntasObjetiva(manager: any, atividadeId: string, perguntas: any[]): Promise<void> {
    for (const perguntaDto of perguntas) {
      const pergunta = manager.create(ObjetivaPerguntas, {
        id_pergunta: uuidv4(),
        id_atividade: atividadeId,
        texto_questao: perguntaDto.texto_questao,
      });
      await manager.save(pergunta);
    }
  }

  async responderMultiplaEscolhaPergunta(dto: ResponderMultiplaEscolhaPerguntaDto) {
    // Verifica se já respondeu esta pergunta
    const jaRespondeu = await this.respostasAlunosMultiplaRepository.findOne({
      where: {
        id_pergunta: dto.id_pergunta,
        aluno_id: dto.id_aluno,
      }
    });
    if (jaRespondeu) {
      throw new BadRequestException('Aluno já respondeu esta pergunta nesta atividade');
    }

    // Buscar o gabarito da pergunta
    const gabarito = await this.multiplaEscolhaGabaritoRepository.findOne({
      where: { id_pergunta: dto.id_pergunta }
    });
    if (!gabarito) {
      throw new NotFoundException('Gabarito não encontrado para a pergunta');
    }

    // Comparar resposta do aluno com o gabarito
    const acerto = dto.resposta.trim().toUpperCase() === gabarito.resposta_correta.trim().toUpperCase() ? '1' : '0';

    // Salvar resposta
    const resposta = this.respostasAlunosMultiplaRepository.create({
      id_resposta: uuidv4(),
      id_pergunta: dto.id_pergunta,
      aluno_id: dto.id_aluno,
      acerto: acerto,
      resposta_aluno: dto.resposta,
      data_feitura: new Date(),
    });

    await this.respostasAlunosMultiplaRepository.save(resposta);

    return {
      message: 'Resposta de múltipla escolha registrada com sucesso',
      acerto: acerto === '1' ? true : false,
      resposta: dto.resposta,
      resposta_correta: gabarito.resposta_correta
    };
  }

  async responderAbertaPergunta(dto: ResponderAbertaPerguntaDto) {
    const jaRespondeu = await this.objetivaRespostasRepository.findOne({
      where: {
        id_pergunta: dto.id_pergunta, // Mudança: usar id_pergunta em vez de id_atividade
        aluno_id: dto.id_aluno,
      }
    });
    if (jaRespondeu) {
      throw new BadRequestException('Aluno já respondeu esta pergunta');
    }

    // Salvar resposta no banco
    const resposta = this.objetivaRespostasRepository.create({
      id_resposta: uuidv4(),
      id_atividade: dto.id_atividade,
      id_pergunta: dto.id_pergunta, // Adicionar id_pergunta
      aluno_id: dto.id_aluno,
      caminho_arquivo: dto.caminho_arquivo,
      data_envio: new Date(),
    });

    await this.objetivaRespostasRepository.save(resposta);
    return { message: 'Resposta aberta registrada com sucesso', resposta };
  }

  async responderAtividadeCompleta(dto: ResponderAtividadeCompletaDto) {
    const atividade = await this.findOne(dto.id_atividade);
    if (!atividade) throw new NotFoundException('Atividade não encontrada');

    // Verifica se já respondeu alguma das perguntas
    for (const resposta of dto.respostas) {
      const jaRespondeuMultipla = await this.respostasAlunosMultiplaRepository.findOne({
        where: { id_pergunta: resposta.id_pergunta, aluno_id: dto.id_aluno }
      });
      const jaRespondeuAberta = await this.objetivaRespostasRepository.findOne({
        where: { id_pergunta: resposta.id_pergunta, aluno_id: dto.id_aluno } // Mudança: usar id_pergunta
      });
      if (jaRespondeuMultipla || jaRespondeuAberta) {
        throw new BadRequestException('Aluno já respondeu esta atividade');
      }
    }

    // Salva as respostas
    for (const resposta of dto.respostas) {
      // Múltipla escolha
      if (resposta.resposta_multipla) {
        const gabarito = await this.multiplaEscolhaGabaritoRepository.findOne({
          where: { id_pergunta: resposta.id_pergunta }
        });
        const acerto = gabarito && resposta.resposta_multipla === gabarito.resposta_correta ? '1' : '0';

        const respostaMultipla = this.respostasAlunosMultiplaRepository.create({
          id_resposta: uuidv4(),
          id_pergunta: resposta.id_pergunta,
          id_atividade: dto.id_atividade,
          aluno_id: dto.id_aluno,
          acerto,
          resposta_aluno: resposta.resposta_multipla,
          data_feitura: new Date(),
        });
        await this.respostasAlunosMultiplaRepository.save(respostaMultipla);
      }

      // Aberta/Objetiva
      if (resposta.resposta_aberta) {
        const respostaAberta = this.objetivaRespostasRepository.create({
          id_resposta: uuidv4(),
          id_atividade: dto.id_atividade,
          id_pergunta: resposta.id_pergunta, // Adicionar id_pergunta
          aluno_id: dto.id_aluno,
          caminho_arquivo: resposta.resposta_aberta,
          data_envio: new Date(),
        });
        await this.objetivaRespostasRepository.save(respostaAberta);
      }
    }

    return { message: 'Respostas registradas com sucesso' };
  }

  async getResultadoAlunoAtividade(id_atividade: string, id_aluno: string) {
    // Busca a atividade e suas perguntas
    const atividade = await this.atividadesRepository.findOne({
      where: { id_atividade },
      relations: [
        'perguntasMultipla',
        'perguntasMultipla.gabarito',
        'perguntasObjetiva'
      ]
    });
    if (!atividade) throw new NotFoundException('Atividade não encontrada');

    // Busca respostas de múltipla escolha do aluno para a atividade
    const respostasMultipla = await this.respostasAlunosMultiplaRepository.find({
      where: { id_atividade, aluno_id: id_aluno },
    });

    // Busca respostas objetivas do aluno para a atividade
    const respostasObjetiva = await this.objetivaRespostasRepository.find({
      where: { id_atividade, aluno_id: id_aluno },
    });

    // Total de perguntas
    const totalQuestoes = (atividade.perguntasMultipla?.length || 0) + (atividade.perguntasObjetiva?.length || 0);

    // Se não respondeu nada
    if ((respostasMultipla.length === 0) && (respostasObjetiva.length === 0)) {
      return { message: 'O aluno ainda não respondeu esta atividade.' };
    }

    // Calcular acertos de múltipla escolha
    let acertos = 0;
    const respostasAluno: any[] = [];

    for (const pergunta of atividade.perguntasMultipla || []) {
      const respostaAluno = respostasMultipla.find(r => r.id_pergunta === pergunta.id_pergunta);
      const gabarito = (pergunta.gabarito && Array.isArray(pergunta.gabarito)) ? pergunta.gabarito[0] : pergunta.gabarito;
      if (respostaAluno) {
        if (respostaAluno.acerto === '1') acertos++;
        respostasAluno.push({
          id_pergunta: pergunta.id_pergunta,
          tipo: 'multipla',
          resposta: respostaAluno.resposta_aluno,
          acerto: respostaAluno.acerto === '1',
          resposta_correta: gabarito?.resposta_correta || null
        });
      } else {
        respostasAluno.push({
          id_pergunta: pergunta.id_pergunta,
          tipo: 'multipla',
          resposta: null,
          acerto: false,
          resposta_correta: gabarito?.resposta_correta || null
        });
      }
    }

    // Respostas abertas
    for (const pergunta of atividade.perguntasObjetiva || []) {
      const respostaAberta = respostasObjetiva.find(r => r.id_pergunta === pergunta.id_pergunta); // Mudança: usar id_pergunta
      respostasAluno.push({
        id_pergunta: pergunta.id_pergunta,
        tipo: 'aberta',
        resposta: respostaAberta ? respostaAberta.caminho_arquivo : null
      });
    }

    // Total respondidas
    const totalRespondidas = respostasAluno.filter(r => r.resposta !== null && r.resposta !== undefined).length;

    return {
      id_atividade,
      id_aluno,
      total_questoes: totalQuestoes,
      total_respondidas: totalRespondidas,
      acertos,
      resultado: `${acertos}/${atividade.perguntasMultipla?.length || 0}`,
      respostas: respostasAluno
    };
  }

  async getResultadosAlunoPorAula(aula_id: string, id_aluno: string) {
    // 1. Buscar todas as atividades da aula
    const atividades = await this.atividadesRepository.find({
      where: { aula_id },
      relations: [
        'perguntasMultipla',
        'perguntasMultipla.gabarito',
        'perguntasObjetiva'
      ]
    });

    if (!atividades.length) {
      throw new NotFoundException('Aula não encontrada');
    }

    type ResultadoAtividadeAluno = {
      id_atividade: string;
      titulo: string;
      total_questoes: number;
      total_respondidas: number;
      acertos: number;
      resultado: string;
      respostas: any[];
    };

    const resultados: ResultadoAtividadeAluno[] = [];

    for (const atividade of atividades) {
      // Busca respostas de múltipla escolha do aluno para a atividade
      const respostasMultipla = await this.respostasAlunosMultiplaRepository.find({
        where: { id_atividade: atividade.id_atividade, aluno_id: id_aluno },
      });

      // Busca respostas objetivas do aluno para a atividade
      const respostasObjetiva = await this.objetivaRespostasRepository.find({
        where: { id_atividade: atividade.id_atividade, aluno_id: id_aluno },
      });

      // Total de perguntas
      const totalQuestoes = (atividade.perguntasMultipla?.length || 0) + (atividade.perguntasObjetiva?.length || 0);

      // Calcular acertos de múltipla escolha
      let acertos = 0;
      const respostasAluno: any[] = [];

      for (const pergunta of atividade.perguntasMultipla || []) {
        const respostaAluno = respostasMultipla.find(r => r.id_pergunta === pergunta.id_pergunta);
        const gabarito = (pergunta.gabarito && Array.isArray(pergunta.gabarito)) ? pergunta.gabarito[0] : pergunta.gabarito;
        if (respostaAluno) {
          if (respostaAluno.acerto === '1') acertos++;
          respostasAluno.push({
            id_pergunta: pergunta.id_pergunta,
            tipo: 'multipla',
            resposta: respostaAluno.resposta_aluno,
            acerto: respostaAluno.acerto === '1',
            resposta_correta: gabarito?.resposta_correta || null
          });
        } else {
          respostasAluno.push({
            id_pergunta: pergunta.id_pergunta,
            tipo: 'multipla',
            resposta: null,
            acerto: false,
            resposta_correta: gabarito?.resposta_correta || null
          });
        }
      }

      // Respostas abertas
      for (const pergunta of atividade.perguntasObjetiva || []) {
        const respostaAberta = respostasObjetiva.find(r => r.id_pergunta === pergunta.id_pergunta); // Mudança: usar id_pergunta
        respostasAluno.push({
          id_pergunta: pergunta.id_pergunta,
          tipo: 'aberta',
          resposta: respostaAberta ? respostaAberta.caminho_arquivo : null
        });
      }

      // Total respondidas
      const totalRespondidas = respostasAluno.filter(r => r.resposta !== null && r.resposta !== undefined).length;

      resultados.push({
        id_atividade: atividade.id_atividade,
        titulo: atividade.titulo,
        total_questoes: totalQuestoes,
        total_respondidas: totalRespondidas,
        acertos,
        resultado: `${acertos}/${atividade.perguntasMultipla?.length || 0}`,
        respostas: respostasAluno
      });
    }

    return resultados;
  }

  async deleteByAulaId(aulaId: string): Promise<void> {
    await this.atividadesRepository.delete({ aula_id: aulaId });
    // Se precisar deletar em cascata nas tabelas filhas, faça aqui também
  }
}
