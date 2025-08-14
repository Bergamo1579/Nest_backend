import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TurmasController } from './turmas.controller';
import { TurmasService } from './turmas.service';
import { Turma } from './entity/turmas.entity';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';
import { UserAccessLevel } from '../auth/entity/user_access_levels.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Turma, UserAccessLevel]),
    PrometheusModule,
  ],
  controllers: [TurmasController],
  providers: [
    TurmasService,
    {
      provide: 'PROM_METRIC_TURMAS_REQUESTS_TOTAL',
      useValue: new Counter({
        name: 'turmas_requests_total',
        help: 'Total de requisições ao endpoint de turmas',
      }),
    },
  ],
})
export class TurmasModule {}