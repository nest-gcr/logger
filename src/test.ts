import { NestFactory } from '@nestjs/core';
import { TestModule } from './tests/utils/test.module';
import { rootLogger } from './logger.module';

async function bootstrap() {
  const app = await NestFactory.create(TestModule, {
    logger: {
      ...rootLogger,
      log: (message, parameters) => {
        return rootLogger.info(message, parameters);
      },
    },
  });
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
