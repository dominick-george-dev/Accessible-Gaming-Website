import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { Request, Response, NextFunction } from 'express';
import a11yChatRoute from './chat-bot/a11yChat';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );

  const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173').split(',');
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin && process.env.NODE_ENV !== 'production') { callback(null, true); return; }
      if (!origin || allowedOrigins.includes(origin)) { callback(null, true); return; }
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'X-Total-Count'],
    credentials: true,
    maxAge: 86400,
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
    );
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
  });
  // Get the underlying Express instance and mount the chat route
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use('/api', a11yChatRoute);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`API is running on: http://localhost:${port}`);
}
void bootstrap();

