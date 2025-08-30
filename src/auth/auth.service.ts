import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth } from './entity/auth.entity';
import { JwtService, JwtModule } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    private readonly jwtService: JwtService,
    @InjectPinoLogger(AuthService.name) private readonly logger: PinoLogger,
  ) {}

  async login(dto: LoginDto): Promise<{
    token: string;
    user: {
      id: string;
      username: string;
      name: string;
      tipo: string;
    };
  }> {
    this.logger.info(`Tentativa de login para usuário: ${dto.username}`);
    const user = await this.authRepository.findOne({
      where: { username: dto.username },
      relations: ['role'],
    });

    // Não revela se usuário ou senha estão errados
    if (!user || !(await bcrypt.compare(dto.password, user.password_hash))) {
      this.logger.warn(`Login falhou para usuário: ${dto.username}`);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    this.logger.info(`Login bem-sucedido para usuário: ${dto.username}`);

    const payload = {
      sub: user.uuid,
      username: user.username,
      name: user.name,
      role: user.role?.name,
    };

    const token = this.jwtService.sign(payload, { expiresIn: '3h' });
    
    const roleMapping = {
      'Administrador': 'administrador',
      'Admin': 'administrador',
      'Aluno': 'aluno',
      'Instrutor': 'instrutor',
      'Empresa': 'empresa'
    };

    const userType = roleMapping[user.role?.name] || 'aluno';

    return {
      token: token,
      user: {
        id: user.uuid,
        username: user.username,
        name: user.name,
        tipo: userType
      }
    };
  }
}

JwtModule.register({
  secret: process.env.JWT_SECRET,
  signOptions: { expiresIn: '3h' },
});
