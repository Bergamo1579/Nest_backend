import { Controller, Post, Body, Inject, BadRequestException, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Counter } from 'prom-client';
import { Request } from 'express';
import * as fs from 'fs';
import * as path from 'path';

const loginAttempts = new Map<string, { count: number, lastAttempt: number, blockedUntil?: number }>();
const MAX_ATTEMPTS = 5;
const BLOCK_TIME_MS = 3 * 60 * 1000; 
const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'login-blocked.log');


if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject('PROM_METRIC_AUTH_REQUESTS_TOTAL') private readonly authRequests: Counter<string>,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Login de usuário' })
  @ApiResponse({ 
    status: 201, 
    description: 'Login realizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'JWT token' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            name: { type: 'string' },
            tipo: { type: 'string', enum: ['administrador', 'aluno', 'instrutor', 'empresa'] }
          }
        }
      }
    }
  })
  async login(@Body() loginDto: LoginDto, @Req() req: Request): Promise<{
    token: string;
    user: {
      id: string;
      username: string;
      name: string;
      tipo: string;
    };
  }> {
    this.authRequests.inc();

    const key = loginDto.username;
    const now = Date.now();
    const attempt = loginAttempts.get(key);

    // Se passou do tempo de bloqueio, reseta as tentativas
    if (attempt?.blockedUntil && now >= attempt.blockedUntil) {
      loginAttempts.delete(key);
    }

    // Bloqueio ativo (não registra log se já está bloqueado)
    if (attempt?.blockedUntil && now < attempt.blockedUntil) {
      throw new BadRequestException('Usuário bloqueado por excesso de tentativas. Tente novamente mais tarde.');
    }

    try {
      const result = await this.authService.login(loginDto);
      loginAttempts.delete(key); // sucesso: zera tentativas
      return result;
    } catch (err) {
      let tentativaAtual = 1;
      if (attempt) {
        const newCount = attempt.count + 1;
        tentativaAtual = newCount;
        if (newCount >= MAX_ATTEMPTS) {
          loginAttempts.set(key, {
            count: newCount,
            lastAttempt: now,
            blockedUntil: now + BLOCK_TIME_MS,
          });
          // Só registra log no momento do bloqueio
          const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
          const hora = new Date(now - 3 * 60 * 60 * 1000).toISOString();
          const logInfo = {
            username: key,
            ip: Array.isArray(ip) ? ip[0] : ip,
            hora,
            userAgent: req.headers['user-agent'],
            referer: req.headers['referer'],
            path: req.originalUrl,
            headers: req.headers,
          };
          
          const logLine = `${JSON.stringify(logInfo)}\n`;
          fs.appendFileSync(LOG_FILE, logLine);
          
          throw new BadRequestException('Usuário bloqueado por excesso de tentativas. Tente novamente mais tarde.');
        } else {
          loginAttempts.set(key, { count: newCount, lastAttempt: now });
        }
      } else {
        loginAttempts.set(key, { count: 1, lastAttempt: now });
      }
      
      throw new BadRequestException(`Credenciais inválidas. Tentativa ${tentativaAtual} de ${MAX_ATTEMPTS}.`);
    }
  }
}



