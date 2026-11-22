import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { APP_CONFIG, AppConfig } from './config/app.config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  app.enableCors();

  const { port } = app.get<AppConfig>(APP_CONFIG);
  await app.listen(port, '0.0.0.0');
  Logger.log(`Apollo Sandbox: http://localhost:${port}/graphql`, 'Bootstrap');
}

void bootstrap();
