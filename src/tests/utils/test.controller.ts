import { Controller, Get, HttpException, Inject, NotFoundException, Req } from '@nestjs/common';
import { Logger } from 'winston';
import { Request } from 'express';
import { LOGGER } from '../../constants';

@Controller()
export class TestController {

  constructor(
    @Inject(LOGGER.PROVIDERS.LOGGER) private readonly logger: Logger,
    @Inject(LOGGER.PROVIDERS.REQUEST_LOGGER) private readonly requestLogger: Logger,
  ) {}

  @Get('/test')
  handleRequest(@Req() req: Request) {
    this.logger.debug('Yooo');
    // this.requestLogger.debug('Hello from request logger');
    // this.requestLogger.debug(JSON.stringify(process.env));
    // this.requestLogger.error(new Error('This is an error'));
    this.requestLogger.debug({
      foo: 'bar',
    });
    return req.headers;
  }

  @Get('/test-error')
  async handleError(@Req() req: Request) {
    this.requestLogger.debug('Entering controller handler');
    throw new Error('WHAT MAAN');
  }

  @Get('/test-warn')
  handleWarnError(@Req() req: Request) {
    throw new NotFoundException();
  }
}
