import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import {
  Conteudo,
  ConteudoArquivo,
  ConteudoImagem,
  ConteudoLink,
  ConteudoTexto,
} from './entity/conteudo.entity';
import {
  CreateConteudoDto,
  CreateConteudoArquivoDto,
  CreateConteudoImagemDto,
  CreateConteudoLinkDto,
  CreateConteudoTextoDto,
} from './dto/create-conteudo.dto';
import {
  UpdateConteudoDto,
} from './dto/update-conteudo.dto';
import { ConteudoQueryDto } from './dto/query-conteudo.dto';
import { v4 as uuidv4 } from 'uuid';
import { execFile } from 'child_process';
import { promisify } from 'util';
import sizeOf from 'image-size';
import * as fs from 'fs/promises';
import * as path from 'path';

const execFileAsync = promisify(execFile);

@Injectable()
export class ConteudoService {
  constructor(
    @InjectRepository(Conteudo)
    private readonly conteudoRepo: Repository<Conteudo>,
    @InjectRepository(ConteudoArquivo)
    private readonly arquivoRepo: Repository<ConteudoArquivo>,
    @InjectRepository(ConteudoImagem)
    private readonly imagemRepo: Repository<ConteudoImagem>,
    @InjectRepository(ConteudoLink)
    private readonly linkRepo: Repository<ConteudoLink>,
    @InjectRepository(ConteudoTexto)
    private readonly textoRepo: Repository<ConteudoTexto>,
  ) {}

  async findAll(query: ConteudoQueryDto): Promise<Conteudo[]> {
    const where: any = {};
    if (query.id) where.id = query.id;
    if (query.aula_id) where.aula_id = query.aula_id;
    if (query.tipo) where.tipo = query.tipo;
    if (query.ordem) where.ordem = Number(query.ordem);
    // Adicione outros campos válidos conforme necessário

    return this.conteudoRepo.find({ where });
  }

  async findOne(id: string): Promise<Conteudo> {
    const conteudo = await this.conteudoRepo.findOneBy({ id });
    if (!conteudo) throw new NotFoundException('Conteúdo não encontrado');
    return conteudo;
  }

  async update(id: string, dto: UpdateConteudoDto): Promise<Conteudo> {
    const conteudo = await this.conteudoRepo.findOneBy({ id });
    if (!conteudo) throw new NotFoundException('Conteúdo não encontrado');
    Object.assign(conteudo, dto);
    return this.conteudoRepo.save(conteudo);
  }

  async delete(id: string): Promise<void> {
    const conteudo = await this.conteudoRepo.findOneBy({ id });
    if (!conteudo) throw new NotFoundException('Conteúdo não encontrado');

    // Deleta imagem do banco e do disco se for tipo imagem
    if (conteudo.tipo === 'imagem') {
      const imagem = await this.imagemRepo.findOneBy({ conteudo_id: id });
      if (imagem) {
        // Remove arquivo físico se existir
        if (imagem.url) {
          const filePath = path.join(process.cwd(), imagem.url.startsWith('/') ? imagem.url.slice(1) : imagem.url);
          await fs.unlink(filePath).catch(() => {});
        }
        await this.imagemRepo.delete({ conteudo_id: id });
      }
    }

    // Deleta arquivo do banco e do disco se for tipo arquivo
    if (conteudo.tipo === 'arquivo') {
      const arquivo = await this.arquivoRepo.findOneBy({ conteudo_id: id });
      if (arquivo) {
        if (arquivo.url) {
          const filePath = path.join(process.cwd(), arquivo.url.startsWith('/') ? arquivo.url.slice(1) : arquivo.url);
          await fs.unlink(filePath).catch(() => {});
        }
        await this.arquivoRepo.delete({ conteudo_id: id });
      }
    }

    // Deleta o conteúdo
    await this.conteudoRepo.delete(id);
  }

  private async scanFileForVirus(filePath: string) {
    const { stdout } = await execFileAsync('clamscan', [filePath]);
    if (
      stdout.includes('Infected files: 0') ||
      stdout.includes('Arquivos infectados: 0')
    ) {
      return true;
    }
    throw new BadRequestException('Arquivo recusado por suspeita de vírus');
  }

  // ARQUIVO
  async addArquivo(conteudo_id: string, file: Express.Multer.File, dto: CreateConteudoArquivoDto): Promise<ConteudoArquivo> {
    if (!file) throw new BadRequestException('Arquivo obrigatório');
    await this.scanFileForVirus(file.path); // Checagem de vírus
    const conteudo = await this.conteudoRepo.findOneBy({ id: conteudo_id });
    if (!conteudo) throw new NotFoundException('Conteúdo não encontrado');
    const arquivo = this.arquivoRepo.create({
      ...dto,
      id: uuidv4(),
      conteudo_id,
      url: `/arc/document/${file.filename}`,
    });
    return this.arquivoRepo.save(arquivo);
  }

  // IMAGEM
  async addImagem(conteudo_id: string, file: Express.Multer.File, dto: CreateConteudoImagemDto): Promise<ConteudoImagem> {
    if (!file) throw new BadRequestException('Imagem obrigatória');
    await this.scanFileForVirus(file.path); // Checagem de vírus
    const conteudo = await this.conteudoRepo.findOneBy({ id: conteudo_id });
    if (!conteudo) throw new NotFoundException('Conteúdo não encontrado');
    const imagem = this.imagemRepo.create({
      ...dto,
      id: uuidv4(),
      conteudo_id,
      url: `/arc/image/${file.filename}`,
    });
    return this.imagemRepo.save(imagem);
  }

  // LINK (inclui vídeo)
  async addLink(conteudo_id: string, dto: CreateConteudoLinkDto): Promise<ConteudoLink> {
    const conteudo = await this.conteudoRepo.findOneBy({ id: conteudo_id });
    if (!conteudo) throw new NotFoundException('Conteúdo não encontrado');
    const link = this.linkRepo.create({
      ...dto,
      id: uuidv4(),
      conteudo_id,
    });
    return this.linkRepo.save(link);
  }

  // TEXTO
  async addTexto(conteudo_id: string, dto: CreateConteudoTextoDto): Promise<ConteudoTexto> {
    const conteudo = await this.conteudoRepo.findOneBy({ id: conteudo_id });
    if (!conteudo) throw new NotFoundException('Conteúdo não encontrado');
    const texto = this.textoRepo.create({
      ...dto,
      id: uuidv4(),
      conteudo_id,
    });
    return this.textoRepo.save(texto);
  }

  // IMAGEM AUTO
  async addImagemAuto(
    aula_id: string,
    arquivo: Express.Multer.File,
    descricao: string,
    ordem?: number // Tornando opcional
  ): Promise<any> {
    if (!arquivo) throw new BadRequestException('Arquivo obrigatório');
    if (arquivo.size > 5 * 1024 * 1024) throw new BadRequestException('Tamanho máximo permitido: 5MB');

    let novaOrdem = ordem || await this.getProximaOrdem(aula_id);
    
    if (ordem && !await this.verificarOrdemDisponivel(aula_id, ordem)) {
      throw new BadRequestException(`Ordem ${ordem} já está em uso nesta aula`);
    }

    const conteudoId = uuidv4();
    const conteudo = this.conteudoRepo.create({
      id: conteudoId,
      aula_id,
      tipo: 'imagem',
      ordem: novaOrdem,
    });
    await this.conteudoRepo.save(conteudo);

    const imagem = this.imagemRepo.create({
      id: uuidv4(),
      conteudo_id: conteudoId,
      url: `/arc/image/${arquivo.filename}`,
      descricao,
      largura: 200,
      altura: 200,
    });
    return this.imagemRepo.save(imagem);
  }

  async addArquivoAuto(aula_id: string, file: Express.Multer.File, descricao?: string, ordem?: number): Promise<ConteudoArquivo> {
    if (!file) throw new BadRequestException('Arquivo obrigatório');
    // await this.scanFileForVirus(file.path); // <-- COMENTE ESTA LINHA

    let novaOrdem = ordem || await this.getProximaOrdem(aula_id);
    
    if (ordem && !await this.verificarOrdemDisponivel(aula_id, ordem)) {
      throw new BadRequestException(`Ordem ${ordem} já está em uso nesta aula`);
    }

    // Cria registro em conteudo
    const conteudo = this.conteudoRepo.create({
      id: uuidv4(),
      aula_id,
      tipo: 'arquivo',
      ordem: novaOrdem,
    });
    await this.conteudoRepo.save(conteudo);

    // Cria registro em conteudo_arquivo
    const tipo_arquivo = file.originalname.split('.').pop();
    const arquivo = this.arquivoRepo.create({
      id: uuidv4(),
      conteudo_id: conteudo.id,
      url: `/arc/document/${file.filename}`,
      descricao,
      tipo_arquivo,
    });
    return this.arquivoRepo.save(arquivo);
  }

  async addTextoAuto(aula_id: string, texto: string, ordem?: number): Promise<ConteudoTexto> {
    let novaOrdem = ordem || await this.getProximaOrdem(aula_id);
    
    if (ordem && !await this.verificarOrdemDisponivel(aula_id, ordem)) {
      throw new BadRequestException(`Ordem ${ordem} já está em uso nesta aula`);
    }

    // Cria registro em conteudo
    const conteudo = this.conteudoRepo.create({
      id: uuidv4(),
      aula_id,
      tipo: 'texto',
      ordem: novaOrdem,
    });
    await this.conteudoRepo.save(conteudo);

    // Cria registro em conteudo_texto
    const conteudoTexto = this.textoRepo.create({
      id: uuidv4(),
      conteudo_id: conteudo.id,
      texto,
    });
    return this.textoRepo.save(conteudoTexto);
  }

  // LINK AUTO
  async addLinkAuto(aula_id: string, dto: CreateConteudoLinkDto, ordem?: number): Promise<ConteudoLink> {
    let novaOrdem = ordem || await this.getProximaOrdem(aula_id);
    
    if (ordem && !await this.verificarOrdemDisponivel(aula_id, ordem)) {
      throw new BadRequestException(`Ordem ${ordem} já está em uso nesta aula`);
    }

    const conteudo = this.conteudoRepo.create({
      id: uuidv4(),
      aula_id,
      tipo: 'link',
      ordem: novaOrdem,
    });
    await this.conteudoRepo.save(conteudo);

    const link = this.linkRepo.create({
      ...dto,
      id: uuidv4(),
      conteudo_id: conteudo.id,
    });
    return this.linkRepo.save(link);
  }

  // Atualiza GENERICO (imagem, arquivo, link, texto)
  async updateConteudoGenerico(
    conteudo_id: string,
    descricao: string,
    ordem?: number,
    texto?: string
  ): Promise<any> {
    const conteudo = await this.conteudoRepo.findOneBy({ id: conteudo_id });
    if (!conteudo) throw new NotFoundException('Conteúdo não encontrado');

    // Se a ordem foi informada e é diferente da atual
    if (ordem !== undefined && ordem !== conteudo.ordem) {
      if (conteudo.ordem === undefined || conteudo.ordem === null) {
        throw new BadRequestException('Conteúdo sem ordem definida não pode ser reorganizado');
      }
      await this.reorganizarOrdens(conteudo.aula_id, conteudo_id, conteudo.ordem, ordem);
    }

    // Agora atualiza o conteúdo específico baseado no tipo
    if (conteudo.tipo === 'imagem') {
      const imagem = await this.imagemRepo.findOneBy({ conteudo_id });
      if (!imagem) throw new NotFoundException('Imagem não encontrada');
      if (descricao !== undefined) imagem.descricao = descricao;
      return this.imagemRepo.save(imagem);
    }

    if (conteudo.tipo === 'arquivo') {
      const arquivo = await this.arquivoRepo.findOneBy({ conteudo_id });
      if (!arquivo) throw new NotFoundException('Arquivo não encontrado');
      if (descricao !== undefined) arquivo.descricao = descricao;
      return this.arquivoRepo.save(arquivo);
    }

    if (conteudo.tipo === 'link') {
      const link = await this.linkRepo.findOneBy({ conteudo_id });
      if (!link) throw new NotFoundException('Link não encontrado');
      if (descricao !== undefined) link.descricao = descricao;
      return this.linkRepo.save(link);
    }

    if (conteudo.tipo === 'texto') {
      const conteudoTexto = await this.textoRepo.findOneBy({ conteudo_id });
      if (!conteudoTexto) throw new NotFoundException('Texto não encontrado');
      if (texto !== undefined) conteudoTexto.texto = texto;
      return this.textoRepo.save(conteudoTexto);
    }

    throw new BadRequestException('Tipo de conteúdo não suportado');
  }

  private async getProximaOrdem(aula_id: string): Promise<number> {
    const maxOrdem = await this.conteudoRepo
      .createQueryBuilder('conteudo')
      .select('MAX(conteudo.ordem)', 'max')
      .where('conteudo.aula_id = :aula_id', { aula_id })
      .getRawOne();
    
    return (maxOrdem?.max || 0) + 1;
  }

  private async verificarOrdemDisponivel(aula_id: string, ordem: number, excluir_id?: string): Promise<boolean> {
    const query = this.conteudoRepo
      .createQueryBuilder('conteudo')
      .where('conteudo.aula_id = :aula_id AND conteudo.ordem = :ordem', { aula_id, ordem });
    
    if (excluir_id) {
      query.andWhere('conteudo.id != :excluir_id', { excluir_id });
    }
    
    const existe = await query.getOne();
    return !existe;
  }

  // Método auxiliar para reorganizar as ordens
  private async reorganizarOrdens(
    aula_id: string, 
    conteudo_id: string, 
    ordemAtual: number | undefined, 
    novaOrdem: number
  ): Promise<void> {
    if (ordemAtual === undefined || ordemAtual === null) {
      throw new BadRequestException('Ordem atual não pode ser indefinida');
    }

    // Se a ordem não mudou, não faz nada
    if (ordemAtual === novaOrdem) {
      return;
    }

    // Usa transação para garantir consistência
    await this.conteudoRepo.manager.transaction(async (manager) => {
      // Busca todos os conteúdos da aula ordenados
      const todosConteudos = await manager.find(Conteudo, {
        where: { aula_id },
        order: { ordem: 'ASC' }
      });

      // Valida se a nova ordem é válida
      if (novaOrdem < 1 || novaOrdem > todosConteudos.length) {
        throw new BadRequestException(`Ordem deve estar entre 1 e ${todosConteudos.length}`);
      }

      // PASSO 1: Define ordens temporárias (negativas) para evitar conflito de constraint
      for (let i = 0; i < todosConteudos.length; i++) {
        await manager.update(Conteudo, 
          { id: todosConteudos[i].id }, 
          { ordem: -(i + 1000) } // Usa números bem negativos para evitar conflito
        );
      }

      // PASSO 2: Remove o item da posição atual
      const itemMovido = todosConteudos.find(c => c.id === conteudo_id);
      if (!itemMovido) {
        throw new NotFoundException('Conteúdo não encontrado para reorganização');
      }

      const listaFiltrada = todosConteudos.filter(c => c.id !== conteudo_id);

      // PASSO 3: Insere o item na nova posição (array é 0-based, mas ordem é 1-based)
      listaFiltrada.splice(novaOrdem - 1, 0, itemMovido);

      // PASSO 4: Atualiza as ordens finais de todos os itens
      for (let i = 0; i < listaFiltrada.length; i++) {
        await manager.update(Conteudo, 
          { id: listaFiltrada[i].id }, 
          { ordem: i + 1 }
        );
      }
    });
  }

  async findByAulaWithDetails(aula_id: string) {
    // Busca todos os conteúdos da aula
    const conteudos = await this.conteudoRepo.find({
      where: { aula_id },
      order: { ordem: 'ASC' }
    });

    // Para cada conteúdo, busca os detalhes conforme o tipo
    const detalhes = await Promise.all(conteudos.map(async (conteudo) => {
      let detalhe: any = { ...conteudo };
      if (conteudo.tipo === 'imagem') {
        const imagem = await this.imagemRepo.findOneBy({ conteudo_id: conteudo.id });
        if (imagem) {
          // Retorna apenas o nome do arquivo
          detalhe.imagem = {
            ...imagem,
            url: imagem.url ? imagem.url.split('/').pop() : null
          };
        }
      }
      if (conteudo.tipo === 'arquivo') {
        const arquivo = await this.arquivoRepo.findOneBy({ conteudo_id: conteudo.id });
        if (arquivo) {
          detalhe.arquivo = {
            ...arquivo,
            url: arquivo.url ? arquivo.url.split('/').pop() : null
          };
        }
      }
      if (conteudo.tipo === 'link') {
        detalhe.link = await this.linkRepo.findOneBy({ conteudo_id: conteudo.id });
      }
      if (conteudo.tipo === 'texto') {
        detalhe.texto = await this.textoRepo.findOneBy({ conteudo_id: conteudo.id });
      }
      // Adicione outros tipos se necessário
      return detalhe;
    }));

    return detalhes;
  }

  async reorderConteudos(
    aula_id: string, 
    reorder: Array<{ conteudo_id: string; nova_ordem: number }>
  ): Promise<any> {
    // Verifica se todos os conteúdos pertencem à aula
    const conteudos = await this.conteudoRepo.find({ 
      where: { aula_id },
      select: ['id', 'ordem']
    });

    const conteudoIds = conteudos.map(c => c.id);
    const reorderIds = reorder.map(r => r.conteudo_id);

    // Valida se todos os IDs pertencem à aula
    const invalidIds = reorderIds.filter(id => !conteudoIds.includes(id));
    if (invalidIds.length > 0) {
      throw new BadRequestException(`Conteúdos não encontrados na aula: ${invalidIds.join(', ')}`);
    }

    // Valida se as novas ordens são únicas e sequenciais
    const novasOrdens = reorder.map(r => r.nova_ordem).sort((a, b) => a - b);
    const expectedOrdens = Array.from({ length: novasOrdens.length }, (_, i) => i + 1);
    
    if (JSON.stringify(novasOrdens) !== JSON.stringify(expectedOrdens)) {
      throw new BadRequestException('As ordens devem ser sequenciais começando em 1');
    }

    // Usa transação para garantir consistência
    return await this.conteudoRepo.manager.transaction(async (manager) => {
      // Temporariamente seta ordens negativas para evitar conflito de unique constraint
      for (let i = 0; i < reorder.length; i++) {
        await manager.update(Conteudo, 
          { id: reorder[i].conteudo_id }, 
          { ordem: -(i + 1) }
        );
      }

      // Agora seta as ordens finais
      for (const item of reorder) {
        await manager.update(Conteudo, 
          { id: item.conteudo_id }, 
          { ordem: item.nova_ordem }
        );
      }

      // Retorna os conteúdos atualizados
      return manager.find(Conteudo, {
        where: { aula_id },
        order: { ordem: 'ASC' }
      });
    });
  }

  async create(dto: CreateConteudoDto): Promise<Conteudo> {
    // Busca a próxima ordem disponível para a aula
    const maxOrdem = await this.conteudoRepo
      .createQueryBuilder('conteudo')
      .select('MAX(conteudo.ordem)', 'max')
      .where('conteudo.aula_id = :aula_id', { aula_id: dto.aula_id })
      .getRawOne();

    const novaOrdem = (maxOrdem?.max || 0) + 1;

    const conteudo = this.conteudoRepo.create({
      ...dto,
      id: uuidv4(),
      ordem: novaOrdem
    });

    return this.conteudoRepo.save(conteudo);
  }
}