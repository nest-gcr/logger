import { NestFactory } from '@nestjs/core';
import { TestModule } from './tests/utils/test.module';

async function bootstrap() {
  const app = await NestFactory.create(TestModule);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
