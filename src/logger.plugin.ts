import {ContextIdFactory, ModuleRef} from '@nestjs/core';
import { Plugin } from '@nestjs/apollo';
import {REQUEST_CONTEXT_ID} from '@nestjs/core/router/request/request-constants';

@Plugin()
export class LoggerPlugin {
  constructor(
    private readonly moduleRef: ModuleRef,
  ) {}

  async requestDidStart(requestContext) {
    if (!requestContext.context.req[REQUEST_CONTEXT_ID]) {
      const newContextId = ContextIdFactory.create();
      Object.defineProperty(requestContext.context.req, REQUEST_CONTEXT_ID, {
        value: newContextId,
        enumerable: false,
        configurable: false,
        writable: false,
      });
      this.moduleRef.registerRequestByContextId(requestContext.context.req, newContextId);
    }

    return {};
  }
}
