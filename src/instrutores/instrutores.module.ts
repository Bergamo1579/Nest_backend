import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstrutoresController } from './instrutores.controller';
import { InstrutoresService } from './instrutores.service';
import { Instrutor } from './entity/instrutores.entity';
import { Auth } from '../auth/entity/auth.entity';
import { UserAccessLevel } from '../auth/entity/user_access_levels.entity';
import { AcessosTemporarios } from './entity/acessos_entity.entity';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Instrutor,
      Auth,
      UserAccessLevel,
      AcessosTemporarios,
    ]),
    PrometheusModule,
  ],
  controllers: [InstrutoresController],
  providers: [
    InstrutoresService,
    {
      provide: 'PROM_METRIC_INSTRUTORES_REQUESTS_TOTAL',
      useValue: new Counter({
        name: 'instrutores_requests_total',
        help: 'Total de requisições ao endpoint de instrutores',
      }),
    },
  ],
  exports: [
    InstrutoresService,
    TypeOrmModule, // Exporta os repositórios registrados acima
  ],
})
export class InstrutoresModule {}