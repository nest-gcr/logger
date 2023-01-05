import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
  Scope,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LOGGER } from '../constants';
import { Logger } from 'winston';
// import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  constructor(
    @Inject(LOGGER.PROVIDERS.LOGGER) private readonly logger: Logger
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const childLogger = this.logger.child({
      className: 'ErrorInterceptor',
    });
    return next.handle().pipe(
      catchError((err) => {
        childLogger.error(err);
        return throwError(() => err);
      }),
    );
  }
}
