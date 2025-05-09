import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Xode Extrinsics API')
    .setDescription('API for fetching pending extrinsics from Xode Kusama and Polkadot')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);

  const logger = new Logger('Bootstrap');
  logger.log('Application is running on http://localhost:3000');

}
bootstrap();