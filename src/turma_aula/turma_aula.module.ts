import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TurmaAulaController } from './turma_aula.controller';
import { TurmaAulaService } from './turma_aula.service';
import { TurmaAula } from './entity/turma_aula.entity';
import { Turma } from '../turmas/entity/turmas.entity'; // ajuste o caminho conforme sua estrutura
import { Aluno } from '../alunos/entity/alunos.entity'; // ajuste o caminho conforme sua estrutura
import { TurmasModule } from '../turmas/turmas.module';
import { AlunosModule } from '../alunos/alunos.module'; // se existir
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

@Module({
  imports: [
    TypeOrmModule.forFeature([TurmaAula, Turma, Aluno]), // ADICIONE Aluno aqui!
    TurmasModule,
    AlunosModule, // se existir
    PrometheusModule,
  ],
  controllers: [TurmaAulaController],
  providers: [
    TurmaAulaService,
    {
      provide: 'PROM_METRIC_TURMA_AULA_REQUESTS_TOTAL',
      useValue: new Counter({
        name: 'turma_aula_requests_total',
        help: 'Total de requisições ao endpoint de turma_aula',
      }),
    },
  ],
})
export class TurmaAulaModule {}