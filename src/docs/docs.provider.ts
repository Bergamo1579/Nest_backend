import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';


export function setupDocs(app) {
  const config = new DocumentBuilder()
    .setTitle('📘 API MARTEC')
    .setDescription('Documentação oficial da API com tema customizado')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  app.use(
    '/reference',
    apiReference({
      content: document,
      theme: 'bluePlanet'
    }),
  );
}