import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnidadesController } from './unidades.controller';
import { UnidadesService } from './unidades.service';
import { Unidades } from './entity/unidades.entity';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';
import { UserAccessLevel } from '../auth/entity/user_access_levels.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Unidades, UserAccessLevel]),
    PrometheusModule,
  ],
  controllers: [UnidadesController],
  providers: [
    UnidadesService,
    {
      provide: 'PROM_METRIC_UNIDADES_REQUESTS_TOTAL',
      useValue: new Counter({
        name: 'unidades_requests_total',
        help: 'Total de requisições ao endpoint de unidades',
      }),
    },
  ],
})
export class UnidadesModule {}
