import { CacheModule } from '@nestjs/cache-manager';
import { cacheConfig } from './cache.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './typeorm.config';
import { DocsModule } from '../docs/docs.module';
import { LoggerModule } from 'nestjs-pino';
import { loggerConfig } from './logger.config';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';



//== ENDPOINTS IMPORTS ==
import { AuthModule } from '../auth/auth.module';
import { UnidadesModule } from '../unidades/unidades.module'
import { InstrutoresModule } from '../instrutores/instrutores.module';
import { EmpresasModule } from '../empresas/empresas.module';
import { TurmasModule } from '../turmas/turmas.module';
import { AlunosModule } from '../alunos/alunos.module';
import { AulasModule } from '../aulas/aulas.module';
import { TurmaAulaModule } from '../turma_aula/turma_aula.module';
import { ConteudoModule } from '../conteudo/conteudo.module';
import { AtividadesModule } from '../atividades/atividades.module';

export const appImports = [
  CacheModule.register(cacheConfig),
  TypeOrmModule.forRoot(typeOrmConfig),
  DocsModule,
  LoggerModule.forRoot(loggerConfig),


  //== ENDPOINTS IMPORTS ==
  AuthModule,
  PrometheusModule.register(),
  UnidadesModule,
  InstrutoresModule,
  EmpresasModule,
  TurmasModule,
  AlunosModule,
  AulasModule,
  TurmaAulaModule,
  ConteudoModule,
  AtividadesModule,
];