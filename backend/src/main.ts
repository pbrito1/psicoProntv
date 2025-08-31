import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
  app.enableCors({
    origin: corsOrigin.split(',').map((o) => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('PsicoPront API')
    .setDescription('Documentação da API NestJS')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global interceptor para logging
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Global filter para tratamento de exceções
  app.useGlobalFilters(new HttpExceptionFilter());

  // Configuração de cache para o navegador
  app.use((req: any, res: any, next: any) => {
    // Cache para recursos estáticos
    if (req.url.includes('/docs') || req.url.includes('/static')) {
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hora
    }
    // Cache para APIs (controlado pelo interceptor)
    else if (req.method === 'GET') {
      res.setHeader('Cache-Control', 'private, max-age=300'); // 5 minutos
    }
    // Sem cache para operações de modificação
    else {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    next();
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
