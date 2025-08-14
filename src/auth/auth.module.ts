import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Auth } from './entity/auth.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { jwtConfig } from '../config/jwt.strategy';
import { Counter } from 'prom-client';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { JwtStrategy } from './guards/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Auth]),
    JwtModule.register(jwtConfig),
    PrometheusModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: 'PROM_METRIC_AUTH_REQUESTS_TOTAL',
      useValue: new Counter({
        name: 'auth_requests_total',
        help: 'Total de requisições ao endpoint de auth',
      }),
    },
  ],

})
export class AuthModule {}