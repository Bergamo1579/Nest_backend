import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AulasController } from './aulas.controller'; // Certifique-se de que não há duplicatas
import { AulasService } from './aulas.service'; // Certifique-se de que não há duplicatas
import { Aula } from './entity/aulas.entity'; // Certifique-se de que não há duplicatas
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AdmPermissionGuard } from '../auth/guards/adm-permission.guard';
import { Reflector } from '@nestjs/core';
import { UserAccessLevel } from '../auth/entity/user_access_levels.entity';
import { Counter } from 'prom-client';
import { AtividadesModule } from '../atividades/atividades.module'; // <-- ADICIONE
import { Atividades } from '../atividades/entity/atividades.entity';
import { RespostasAlunosMultipla } from '../atividades/entity/respostas-alunos-multipla.entity';
import { ObjetivaRespostas } from '../atividades/entity/objetiva-respostas.entity';
import { MultiplaEscolhaPerguntas } from '../atividades/entity/multipla-escolha-perguntas.entity';
import { ObjetivaPerguntas } from '../atividades/entity/objetiva-perguntas.entity';
import { MultiplaEscolhaGabarito } from '../atividades/entity/multipla-escolha-gabarito.entity';
import { ConteudoModule } from '../conteudo/conteudo.module'; // <-- Importe aqui
import { AtividadesService } from '../atividades/atividades.service';
import { MultiplaEscolhaRespostas } from '../atividades/entity/multipla-escolha-respostas.entity'; // <-- importe

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Aula,
      Atividades,
      RespostasAlunosMultipla,
      ObjetivaRespostas,
      MultiplaEscolhaPerguntas,
      ObjetivaPerguntas,
      MultiplaEscolhaGabarito,
      MultiplaEscolhaRespostas,
      UserAccessLevel,
    ]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
    AtividadesModule,
    ConteudoModule, // <-- Adicione aqui
  ],
  controllers: [AulasController],
  providers: [
    AulasService,
    AdmPermissionGuard,
    Reflector,
    AtividadesService,
    {
      provide: 'PROM_METRIC_AULAS_REQUESTS_TOTAL',
      useValue: new Counter({
        name: 'aulas_requests_total',
        help: 'Total de requisições ao endpoint de aulas',
      }),
    },
  ],
  exports: [AdmPermissionGuard, AulasService],
})
export class AulasModule {}