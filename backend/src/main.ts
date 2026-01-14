import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import * as express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security: Add helmet for HTTP headers protection
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow embedding for GraphQL Playground
  }));

  // Enable JSON parsing for all routes
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Security: Rate limiting for API
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  // Security: Stricter rate limit for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 auth requests per windowMs
    message: { error: 'Too many authentication attempts, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/graphql', (req, res, next) => {
    // Apply stricter limits to login/register mutations
    if (req.body?.query?.includes('login') || req.body?.query?.includes('register')) {
      return authLimiter(req, res, next);
    }
    next();
  });

  // Get allowed origins from environment
  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
  const allowedOrigins = configService.get<string>('CORS_ORIGINS', frontendUrl)
    .split(',')
    .map(origin => origin.trim())
    .filter(origin => origin.length > 0);

  // Enable CORS with env-configurable origins
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin) || 
          allowedOrigins.includes('*') ||
          configService.get<string>('NODE_ENV') === 'development') {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Enable validation with security options
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      forbidUnknownValues: true,
    }),
  );

  // Verify JWT secret is set in production
  const jwtSecret = configService.get<string>('JWT_SECRET');
  if (configService.get<string>('NODE_ENV') === 'production') {
    if (!jwtSecret || jwtSecret === 'your-secret-key-change-in-production' || jwtSecret.length < 32) {
      console.error('\n❌ SECURITY ERROR: JWT_SECRET must be set to a secure value (min 32 chars) in production!');
      process.exit(1);
    }
  }

  const port = configService.get<number>('PORT', 4000);
  await app.listen(port);

  console.log(`\n🚀 Application is running on: http://localhost:${port}`);
  console.log(`📊 GraphQL Playground: http://localhost:${port}/graphql`);
  console.log(`🔒 Security: Rate limiting enabled, Helmet active`);
  console.log(`🤖 Slack Integration: Enabled`);
  console.log(`\n✅ TM Support Portal Backend Ready!\n`);
}

bootstrap();
