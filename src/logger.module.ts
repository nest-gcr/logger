import { Module } from '@nestjs/common';
import { LoggingWinston } from '@google-cloud/logging-winston';
import * as winston from 'winston';
import {Request} from 'express';
import { REQUEST } from '@nestjs/core';
import axios from 'axios';

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
        const myFormat = winston.format.printf((options) => {
          const getSeverity = () => {
            switch (options.level) {
              case 'WARN':
                return 'WARNING';
              default:
              return options.level.toUpperCase();
            }
          };
          return JSON.stringify({
            ...options,
            severity: getSeverity(),
            message: options.stack ? options.stack : options.message,
          });
        });
        const logger = winston.createLogger({
          level: 'debug',
          format: winston.format.combine(
            winston.format.timestamp(),
            myFormat,
          ),
          transports: [
            new winston.transports.Console(),
            // Add Stackdriver Logging
            // loggingWinston,
          ],
        });
        return logger;
      },
    },
    {
      provide: LOGGER.PROVIDERS.REQUEST_LOGGER,
      useFactory: (logger: winston.Logger, request: Request, tracePrefix: string) => {
        let traceKey = 'unknown-trace-key';
        let spanKey = 'unknown-span-key';
        if (request?.headers?.['x-cloud-trace-context'] && typeof request?.headers?.['x-cloud-trace-context'] === 'string') {
          const parsed = request?.headers?.['x-cloud-trace-context'].match(/^([a-z0-9]*)\/([0-9]*)/);
          traceKey = `projects/${tracePrefix}/traces/${parsed[1]}`;
          spanKey = parsed[2];
        }
        const childLogger = logger.child({
          [LoggingWinston.LOGGING_TRACE_KEY]: traceKey,
          [LoggingWinston.LOGGING_SPAN_KEY]: spanKey,
          [LoggingWinston.LOGGING_SAMPLED_KEY]: true,
        });

        return childLogger;
      },
      inject: [LOGGER.PROVIDERS.LOGGER, REQUEST, 'LOGGER_TRACE_ID_PREFIX'],
    },
    {
      provide: 'LOGGER_TRACE_ID_PREFIX',
      useFactory: async (logger: winston.Logger) => {
        try {
          const { data } = await axios.get('http://metadata.google.internal/computeMetadata/v1/project/project-id', {
            timeout: 1000,
            headers: {'Metadata-Flavor': 'Google'},
          });
          logger.debug(`Found project ID ${data}`);
          return data;
        } catch (error) {
          logger.warn('Could not determine project ID');
          return '';
        }
      },
      inject: [LOGGER.PROVIDERS.LOGGER],
    },
  ],
  exports: [LOGGER.PROVIDERS.LOGGER, LOGGER.PROVIDERS.REQUEST_LOGGER],
})
export class LoggerModule {}
