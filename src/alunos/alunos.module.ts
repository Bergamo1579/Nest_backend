import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlunosController } from './alunos.controller';
import { AlunosService } from './alunos.service';
import { Aluno } from './entity/alunos.entity';
import { Auth } from '../auth/entity/auth.entity';
import { UserAccessLevel } from '../auth/entity/user_access_levels.entity';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';
import { InstrutoresModule } from '../instrutores/instrutores.module';
import { AlunoAulaPresence } from './entity/aluno_aula_presence.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Aluno, Auth, UserAccessLevel, AlunoAulaPresence]),
    PrometheusModule,
    InstrutoresModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '3h' },
    }),
  ],
  controllers: [AlunosController],
  providers: [
    AlunosService,
    {
      provide: 'PROM_METRIC_ALUNOS_REQUESTS_TOTAL',
      useValue: new Counter({
        name: 'alunos_requests_total',
        help: 'Total de requisições ao endpoint de alunos',
      }),
    },
  ],
  exports: [JwtModule],
})
export class AlunosModule {}