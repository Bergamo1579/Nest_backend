import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AtividadesController } from './atividades.controller';
import { AtividadesService } from './atividades.service';
import { Atividades } from './entity/atividades.entity';
import { MultiplaEscolhaPerguntas } from './entity/multipla-escolha-perguntas.entity';
import { MultiplaEscolhaRespostas } from './entity/multipla-escolha-respostas.entity';
import { MultiplaEscolhaGabarito } from './entity/multipla-escolha-gabarito.entity';
import { ObjetivaPerguntas } from './entity/objetiva-perguntas.entity';
import { RespostasAlunosMultipla } from './entity/respostas-alunos-multipla.entity';
import { ObjetivaRespostas } from './entity/objetiva-respostas.entity';
import { Aula } from '../aulas/entity/aulas.entity'; // ajuste o caminho se necessário
import { AuthModule } from '../auth/auth.module'; // ajuste o caminho conforme seu projeto
import { UserAccessLevel } from '../auth/entity/user_access_levels.entity'; // ajuste o caminho se necessário

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Atividades,
      MultiplaEscolhaPerguntas,
      MultiplaEscolhaRespostas,
      MultiplaEscolhaGabarito,
      ObjetivaPerguntas,
      RespostasAlunosMultipla,
      ObjetivaRespostas,
      Aula,
      UserAccessLevel
    ]),
    AuthModule,
  ],
  controllers: [AtividadesController],
  providers: [AtividadesService],
  exports: [AtividadesService],
})
export class AtividadesModule {}