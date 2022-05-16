import { Module } from '@nestjs/common';
import { LoggingWinston } from '@google-cloud/logging-winston';
import * as winston from 'winston';
import {Request} from 'express';
import { REQUEST } from '@nestjs/core';

export const LOGGER = {
  PROVIDERS: {
    LOGGER: 'LOGGER',
    REQUEST_LOGGER: 'REQUEST_LOGGER',
  },
};

@Module({
  providers: [
    {
      provide: LOGGER.PROVIDERS.LOGGER,
      useFactory: () => {
        const loggingWinston = new LoggingWinston({
          redirectToStdout: true,
        });
        const logger = winston.createLogger({
          level: 'debug',
          transports: [
            new winston.transports.Console(),
            // Add Stackdriver Logging
            loggingWinston,
          ],
        });
        return logger;
      },
    },
    {
      provide: LOGGER.PROVIDERS.REQUEST_LOGGER,
      useFactory: (logger: winston.Logger, request: Request) => {
        let traceKey = 'unknown-trace-key';
        let spanKey = 'unknown-span-key';
        console.log(request.headers);
        if (request?.headers?.['x-cloud-trace-context'] && typeof request?.headers?.['x-cloud-trace-context'] === 'string') {
          console.log(request?.headers?.['x-cloud-trace-context']);
          const parsed = request?.headers?.['x-cloud-trace-context'].match(/^([a-z0-9]*)\/([0-9]*)$/);
          console.log(parsed);
          traceKey = parsed[1];
          spanKey = parsed[2];
        }
        const childLogger = logger.child({
          [LoggingWinston.LOGGING_TRACE_KEY]: traceKey,
          [LoggingWinston.LOGGING_SPAN_KEY]: spanKey,
          [LoggingWinston.LOGGING_SAMPLED_KEY]: true,
        });

        return childLogger;
      },
      inject: [LOGGER.PROVIDERS.LOGGER, REQUEST],
    },
  ],
  exports: [LOGGER.PROVIDERS.LOGGER, LOGGER.PROVIDERS.REQUEST_LOGGER],
})
export class LoggerModule {}
