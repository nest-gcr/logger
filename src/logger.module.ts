import { Module } from '@nestjs/common';
import { LoggingWinston } from '@google-cloud/logging-winston';
import * as winston from 'winston';
import { Request } from 'express';
import { APP_INTERCEPTOR, REQUEST } from '@nestjs/core';
import axios from 'axios';
import { install } from 'source-map-support';
import { LOGGER } from './constants';
import { ErrorInterceptor } from './interceptors/ErrorInterceptor';
import { CONTEXT } from '@nestjs/graphql';
import { LoggerPlugin } from './logger.plugin';

install();

const myFormat = winston.format.printf((options) => {
  if (process.env.LOGGER_DRIVER === 'gcp') {
    const getSeverity = () => {
      switch (options.level) {
        case 'WARN':
          return 'WARNING';
        default:
          return options.level.toUpperCase();
      }
    };

    const omitSingle = (key, { [key]: _, ...obj }) => obj;

    return JSON.stringify({
      ...omitSingle('stack', options),
      severity: getSeverity(),
      message: options.stack ? options.stack : options.message,
    });
  }

  return `[${options.level.toUpperCase()}][${options.timestamp}][${options[LoggingWinston.LOGGING_TRACE_KEY] || 'global'}] ${options.stack ? options.stack : options.message}`
});

export const rootLogger = winston.createLogger({
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

@Module({
  providers: [
    {
      provide: LOGGER.PROVIDERS.LOGGER,
      useFactory: () => {
        return rootLogger;
      },
    },
    {
      provide: LOGGER.PROVIDERS.REQUEST_LOGGER,
      useFactory: (logger: winston.Logger, request: Request, tracePrefix: string, context: any) => {
        const req = context?.req || request;
        let traceKey = (Math.random() + 1).toString(36).substring(7);
        let spanKey = 'unknown-span-key';
        if (req?.headers?.['x-cloud-trace-context'] && typeof req?.headers?.['x-cloud-trace-context'] === 'string') {
          const parsed = req?.headers?.['x-cloud-trace-context'].match(/^([a-z0-9]*)\/([0-9]*)/);
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
      inject: [LOGGER.PROVIDERS.LOGGER, REQUEST, 'LOGGER_TRACE_ID_PREFIX', CONTEXT],
    },
    {
      provide: 'LOGGER_TRACE_ID',
      useFactory: async () => {
        let traceId = null;
        return {
          set(t: string) {
            traceId = t;
          },
          get() {
            return traceId;
          },
        };
      },
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
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorInterceptor,
    },
    LoggerPlugin,
  ],
  exports: [LOGGER.PROVIDERS.LOGGER, LOGGER.PROVIDERS.REQUEST_LOGGER],
})
export class LoggerModule {}
