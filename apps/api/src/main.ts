import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');
  const openApiConfig = new DocumentBuilder()
    .setTitle('Yalla API')
    .setDescription('API commune aux interfaces Yalla.')
    .setVersion('1.0')
    .build();
  const openApiDocument = SwaggerModule.createDocument(app, openApiConfig);
  SwaggerModule.setup('api/docs', app, openApiDocument);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  // Le site client et l'administration sont distincts, mais partagent cette API.
  app.enableCors({
    origin: [
      config.get<string>('ADMIN_WEB_ORIGIN', 'http://localhost:3001'),
      config.get<string>('CLIENT_WEB_ORIGIN', 'http://localhost:3002'),
    ],
  });
  app.enableShutdownHooks();

  const port = Number(config.get<string>('API_PORT', '3000'));
  await app.listen(port, '0.0.0.0');
}

void bootstrap();
