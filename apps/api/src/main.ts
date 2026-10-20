import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableCors({
    origin: config.get<string>('ADMIN_WEB_ORIGIN', 'http://localhost:3001'),
  });
  app.enableShutdownHooks();

  const port = Number(config.get<string>('API_PORT', '3000'));
  await app.listen(port, '0.0.0.0');
}

void bootstrap();
