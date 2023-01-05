import { Inject, Injectable, MiddlewareConsumer, Module, NestMiddleware } from '@nestjs/common';
import { LoggingWinston } from '@google-cloud/logging-winston';
import * as winston from 'winston';
import { NextFunction, Request } from 'express';
import { APP_INTERCEPTOR, REQUEST } from '@nestjs/core';
import axios from 'axios';
import { LOGGER } from './constants';
import { ErrorInterceptor } from './interceptors/ErrorInterceptor';
import * as _ from 'lodash';
import { AsyncLocalStorage } from 'node:async_hooks';

const asyncLocalStorage = new AsyncLocalStorage<any>()

const baseFormats = [
  winston.format.timestamp(),
  winston.format.errors({
    stack: true
  }),
  winston.format((info, opts) => {
    const store = asyncLocalStorage.getStore()
    return {
      ...info,
      ...store,
      message: info.stack || info.message
    };
  })(),
  winston.format((info, opts) => {
    info.severity = info.level.toUpperCase()
    if (info.severity === 'WARN') {
      info.severity = 'WARNING'
    }
    return info
  })(),
  winston.format((info, opts) => {
    if (typeof info.message === 'object' && info.message) {
      info.message = JSON.stringify(info.message)
    }
    return info
  })()
]

const formats = {
  'text': winston.format.combine(
    ...baseFormats,
    winston.format.printf(options => {
      const colorizer = winston.format.colorize()
      return colorizer.colorize(options.level, `[${options.level.toUpperCase()}][${options.timestamp}][${options[LoggingWinston.LOGGING_TRACE_KEY] || 'global'}][${options.className || 'UNKNOWN'}] ${options.message}`)
    })
  ),
  'gcr': winston.format.combine(
    ...baseFormats,
    winston.format.json()
  )
}

export const rootLogger = winston.createLogger({
  level: 'debug',
  format: formats[process.env.LOGGER_DRIVER || 'text'],
  transports: [
    new winston.transports.Console()
  ],
});

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor (
    @Inject('LOGGER_TRACE_ID_PREFIX') private readonly tracePrefix: string
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    console.log('entering loggerMiddleware...')
    let traceKey = (Math.random() + 1).toString(36).substring(7);
    let spanKey = 'unknown-span-key';
    if (req?.headers?.['x-cloud-trace-context'] && typeof req?.headers?.['x-cloud-trace-context'] === 'string') {
      const parsed = req?.headers?.['x-cloud-trace-context'].match(/^([a-z0-9]*)\/([0-9]*)/);
      traceKey = `projects/${this.tracePrefix}/traces/${parsed[1]}`;
      spanKey = parsed[2];
    }
    asyncLocalStorage.run({
      [LoggingWinston.LOGGING_TRACE_KEY]: traceKey,
      [LoggingWinston.LOGGING_SPAN_KEY]: spanKey,
      [LoggingWinston.LOGGING_SAMPLED_KEY]: true,
    }, () => {
      next()
    })
  }
}

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
      useFactory: (logger: winston.Logger) => {
        return logger;
      },
      inject: [LOGGER.PROVIDERS.LOGGER],
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
  ],
  exports: [LOGGER.PROVIDERS.LOGGER, LOGGER.PROVIDERS.REQUEST_LOGGER],
})
export class LoggerModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
