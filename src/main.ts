import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import * as express from 'express';
import * as dotenv from 'dotenv';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as path from 'path';
import { join } from 'path';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // -------------------------
  // GLOBAL CONFIG
  // -------------------------
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

  // -------------------------
  // SOCKET.IO ADAPTER
  // -------------------------
  app.useWebSocketAdapter(new IoAdapter(app));

  // -------------------------
  // STATIC FRONTEND (React build)
  // -------------------------
  const clientPath = path.join(__dirname, '..', 'dist');

  app.use(express.static(clientPath));

  // uploads folder
  app.use('/uploads', express.static('uploads'));

  // -------------------------
  // CORS (safe default)
  // -------------------------
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // -------------------------
  // SPA FALLBACK (IMPORTANT)
  // -------------------------
  const server = app.getHttpAdapter().getInstance();

  server.get('*', (req, res, next) => {
    // NEVER interfere with socket.io or api routes
    if (req.url.startsWith('/socket.io')) return next();
    if (req.url.startsWith('/api')) return next();

    res.sendFile(join(clientPath, 'index.html'));
  });

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

bootstrap();
