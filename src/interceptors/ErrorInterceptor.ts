import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
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
    private readonly moduleRef: ModuleRef,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = await this.getRequest(context);
    const contextId = ContextIdFactory.getByRequest(req);
    const logger = await this.moduleRef.resolve<string, Logger>(LOGGER.PROVIDERS.REQUEST_LOGGER, contextId);
    const childLogger = logger.child({
      className: 'ErrorInterceptor',
    });
    return next.handle().pipe(
      catchError((err) => {
        childLogger.error(err);
        return throwError(err);
      }),
    );
  }

  async getRequest(context: ExecutionContext) {
    try {
      const { GqlExecutionContext } = await import('@nestjs/graphql');
      if (context.getType<'graphql'>() === 'graphql') {
        // do something that is only important in the context of GraphQL requests
        const gql = GqlExecutionContext.create(context);
        return gql.getContext().req;
      }
      // tslint:disable-next-line:no-empty
    } catch {}

    return context.switchToHttp().getRequest();
  }
}
