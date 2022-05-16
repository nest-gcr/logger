import { Controller, Get, Inject, Req } from '@nestjs/common';
import { LOGGER } from '../../logger.module';
import { Logger } from 'winston';
import { Request } from 'express';

@Controller()
export class TestController {

  constructor(
    @Inject(LOGGER.PROVIDERS.LOGGER) private readonly logger: Logger,
    @Inject(LOGGER.PROVIDERS.REQUEST_LOGGER) private readonly requestLogger: Logger,
  ) {}

  @Get('/test')
  handleRequest(@Req() req: Request) {
    this.logger.debug('Yooo');
    this.requestLogger.debug('Hello from request logger');
    this.requestLogger.debug(JSON.stringify(process.env));
    this.requestLogger.error(new Error('This is an error'));
    return req.headers;
  }
}
