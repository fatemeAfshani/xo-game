import * as config from 'config';

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('bootstrap');
  const port = config.get('app.port');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(port);
  logger.log(`app is up and running on port ${port}`);
}
bootstrap();
