import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ADM_PERMISSION_KEY } from '../decorators/adm-permission.decorator';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAccessLevel } from '../entity/user_access_levels.entity'; // Crie essa entity conforme sua tabela

@Injectable()
export class AdmPermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(UserAccessLevel)
    private readonly userAccessLevelRepo: Repository<UserAccessLevel>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredLevels = this.reflector.getAllAndOverride<string[]>(ADM_PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredLevels) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Busca os níveis de acesso do usuário
    const accessLevels = await this.userAccessLevelRepo
      .createQueryBuilder('ual')
      .innerJoinAndSelect('ual.accessLevel', 'al')
      .where('ual.user_uuid = :uuid', { uuid: user.userId })
      .getMany();

    const userLevels = accessLevels.map(ual => ual.accessLevel.name);

    const hasPermission = userLevels.some(level => requiredLevels.includes(level));
    if (!hasPermission) throw new ForbiddenException('Access denied: insufficient permission');

    return true;
  }
}