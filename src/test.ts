import { NestFactory } from '@nestjs/core';
import { Controller, Get, Inject, Module, Req } from '@nestjs/common';
import { LoggerModule, LOGGER } from './logger.module';
import {Request} from 'express';
import { Logger } from 'winston';

@Controller()
class TestController {

  constructor(
    @Inject(LOGGER.PROVIDERS.LOGGER) private readonly logger: Logger,
    @Inject(LOGGER.PROVIDERS.REQUEST_LOGGER) private readonly requestLogger: Logger,
  ) {}

  @Get('/test')
  handleRequest(@Req() req: Request) {
    this.logger.debug('Yooo');
    this.requestLogger.debug('Hello from request logger');
    return req.headers;
  }
}

@Module({
  imports: [LoggerModule],
  controllers: [TestController],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
