import {
  CallHandler,
  ExecutionContext, HttpException,
  Inject,
  Injectable, InternalServerErrorException,
  NestInterceptor,
  Scope,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LOGGER } from '../constants';
import { Logger } from 'winston';

@Injectable({
  scope: Scope.REQUEST,
})
export class ErrorInterceptor implements NestInterceptor {
  constructor(@Inject(LOGGER.PROVIDERS.REQUEST_LOGGER) private readonly logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        this.logger.error(err);
        if (!(err instanceof HttpException)) {
          return throwError(new InternalServerErrorException());
        }
        return throwError(err);
      }),
    );
  }
}
