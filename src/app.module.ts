import { Module } from '@nestjs/common';
import { appImports } from './config/modules-imports';

@Module({
  imports: appImports,
})
export class AppModule {}
