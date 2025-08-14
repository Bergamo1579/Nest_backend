import { SetMetadata } from '@nestjs/common';

export const ADM_PERMISSION_KEY = 'adm_permission';
export const AdmPermission = (...levels: string[]) => SetMetadata(ADM_PERMISSION_KEY, levels);