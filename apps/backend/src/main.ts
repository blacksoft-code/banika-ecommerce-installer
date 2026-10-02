import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors();

  // ---------- Swagger Setup ----------
  const config = new DocumentBuilder()
    .setTitle('Banika E-commerce API')
    .setDescription('Backend API documentation for Banika E-commerce')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        in: 'header',
      },
      'access-token', // এই নামটাই controller-এ reference করা হবে
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  // ------------------------------------

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();