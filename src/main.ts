import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as express from 'express';
import { IoAdapter } from '@nestjs/platform-socket.io';
dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useWebSocketAdapter(new IoAdapter(app));

  app.use('/uploads', express.static('uploads'));
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
