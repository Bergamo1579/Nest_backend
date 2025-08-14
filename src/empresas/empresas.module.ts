import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpresasController } from './empresas.controller';
import { EmpresasService } from './empresas.service';
import { Empresa } from './entity/empresas.entity';
import { Auth } from '../auth/entity/auth.entity';
import { UserAccessLevel } from '../auth/entity/user_access_levels.entity';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

@Module({
  imports: [
    TypeOrmModule.forFeature([Empresa, Auth, UserAccessLevel]),
    PrometheusModule,
  ],
  controllers: [EmpresasController],
  providers: [
    EmpresasService,
    {
      provide: 'PROM_METRIC_EMPRESAS_REQUESTS_TOTAL',
      useValue: new Counter({
        name: 'empresas_requests_total',
        help: 'Total de requisições ao endpoint de empresas',
      }),
    },
  ],
})
export class EmpresasModule {}