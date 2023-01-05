import { install } from 'source-map-support';
import { NestFactory } from '@nestjs/core';
import { TestModule } from './tests/utils/test.module';
import { rootLogger } from './logger.module';

install()

async function bootstrap() {
  const app = await NestFactory.create(TestModule, {
    logger: {
      ...rootLogger,
      log: (message, parameters) => {
        return rootLogger.info(message, parameters);
      },
      error: (...args) => {
        return rootLogger.error(...args)
      }
    },
  });
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
