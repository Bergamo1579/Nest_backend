import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupDocs } from './docs/docs.provider';
import { TypeOrmExceptionFilter } from './common/filters/typeorm-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { rateLimitConfig } from './config/rate-limit.config';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { corsConfig } from './config/cors.config';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          'script-src': ["'self'", 'https://cdn.jsdelivr.net'],
        },
      },
    })
  );
  app.enableCors({
    origin: [
      'http://localhost:3001',
      'http://localhost:3000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  app.use(rateLimitConfig);
  app.useGlobalFilters(new TypeOrmExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());

  setupDocs(app);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();
